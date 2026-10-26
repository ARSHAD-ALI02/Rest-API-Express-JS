const { describe, it } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const Category = require('../src/models/Category');
const Course = require('../src/models/Course');
const User = require('../src/models/User');
const categoryController = require('../src/controllers/categoryController');
const courseController = require('../src/controllers/courseController');
const authController = require('../src/controllers/authController');
const { protect } = require('../src/middleware/authMiddleware');
const app = require('../src/app');

// Helper to create mock req and res
function createMockReqRes(reqData = {}) {
  const req = {
    body: {},
    params: {},
    query: {},
    headers: {},
    ...reqData,
  };
  const res = {
    statusCode: 200,
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.data = payload;
      return this;
    },
  };
  return { req, res };
}

describe('Phase 1: Category Module Tests', () => {
  it('Category model should have name and description fields with correct types', () => {
    assert.ok(Category.schema.paths.name, 'Category schema should have a name field');
    assert.strictEqual(Category.schema.paths.name.instance, 'String');
    assert.strictEqual(Category.schema.paths.name.isRequired, true, 'Name should be required');

    assert.ok(Category.schema.paths.description, 'Category schema should have a description field');
    assert.strictEqual(Category.schema.paths.description.instance, 'String');
  });

  it('Category model validation should fail if name is missing', async () => {
    const category = new Category({ description: 'Testing without name' });
    let error;
    try {
      await category.validate();
    } catch (err) {
      error = err;
    }
    assert.ok(error, 'Validation should fail when name is missing');
    assert.ok(error.errors.name, 'Name error should be present');
  });

  it('createCategory controller should reject missing name with 400 and error message', async () => {
    const { req, res } = createMockReqRes({ body: { description: 'Missing name' } });
    await categoryController.createCategory(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.data.error, 'Name is required');
  });

  it('getCategoryById controller should return 404 for non-existent or invalid ID', async () => {
    const { req, res } = createMockReqRes({ params: { id: 'invalid-id-format' } });
    await categoryController.getCategoryById(req, res);
    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.data.error, 'Category not found');
  });

  it('updateCategory controller should return 404 for non-existent or invalid ID', async () => {
    const { req, res } = createMockReqRes({ params: { id: 'invalid-id-format' }, body: { name: 'New' } });
    await categoryController.updateCategory(req, res);
    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.data.error, 'Category not found');
  });

  it('deleteCategory controller should return 404 for non-existent or invalid ID', async () => {
    const { req, res } = createMockReqRes({ params: { id: 'invalid-id-format' } });
    await categoryController.deleteCategory(req, res);
    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.data.error, 'Category not found');
  });
});

describe('Phase 2: Course Module Tests', () => {
  it('Course model should have title, description, price, and category fields', () => {
    assert.ok(Course.schema.paths.title, 'Course schema should have title field');
    assert.strictEqual(Course.schema.paths.title.instance, 'String');
    assert.strictEqual(Course.schema.paths.title.isRequired, true);

    assert.ok(Course.schema.paths.category, 'Course schema should have category field');
    assert.strictEqual(Course.schema.paths.category.instance, 'ObjectId');
    assert.strictEqual(
      Course.schema.paths.category.options.ref,
      'Category',
      'Course category should reference Category model'
    );
    assert.strictEqual(Course.schema.paths.category.isRequired, true, 'Category should be required');

    assert.ok(Course.schema.paths.price, 'Course schema should have price field');
    assert.strictEqual(Course.schema.paths.price.instance, 'Number');
  });

  it('Course model validation should fail if category or title is missing', async () => {
    const course = new Course({ description: 'No title or category' });
    let error;
    try {
      await course.validate();
    } catch (err) {
      error = err;
    }
    assert.ok(error, 'Validation should fail when required fields are missing');
    assert.ok(error.errors.title, 'Title error should be present');
    assert.ok(error.errors.category, 'Category reference error should be present');
  });

  it('createCourse controller should validate title and category presence', async () => {
    const { req: req1, res: res1 } = createMockReqRes({ body: {} });
    await courseController.createCourse(req1, res1);
    assert.strictEqual(res1.statusCode, 400);
    assert.strictEqual(res1.data.error, 'Course title is required');

    const { req: req2, res: res2 } = createMockReqRes({ body: { title: 'Node.js Mastery' } });
    await courseController.createCourse(req2, res2);
    assert.strictEqual(res2.statusCode, 400);
    assert.strictEqual(res2.data.error, 'Category ID is required');
  });

  it('getCourseById controller should return 404 if course not found (Screenshot 5)', async () => {
    const { req, res } = createMockReqRes({ params: { id: 'invalid-course-id' } });
    await courseController.getCourseById(req, res);
    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.data.error, 'Course not found');
  });

  it('deleteCourse controller should return 404 if course not found', async () => {
    const { req, res } = createMockReqRes({ params: { id: 'invalid-course-id' } });
    await courseController.deleteCourse(req, res);
    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.data.error, 'Course not found');
  });
});

describe('Phase 3: Auth Module Tests', () => {
  it('User model should have email and password fields', () => {
    assert.ok(User.schema.paths.email, 'User schema should have email field');
    assert.strictEqual(User.schema.paths.email.instance, 'String');
    assert.strictEqual(User.schema.paths.email.isRequired, true);

    assert.ok(User.schema.paths.password, 'User schema should have password field');
    assert.strictEqual(User.schema.paths.password.instance, 'String');
    assert.strictEqual(User.schema.paths.password.isRequired, true);
  });

  it('User model validation should fail if email or password is missing', async () => {
    const user = new User({});
    let error;
    try {
      await user.validate();
    } catch (err) {
      error = err;
    }
    assert.ok(error, 'Validation should fail when required fields are missing');
    assert.ok(error.errors.email, 'Email error should be present');
    assert.ok(error.errors.password, 'Password error should be present');
  });

  it('register controller should require email and password', async () => {
    const { req, res } = createMockReqRes({ body: {} });
    await authController.register(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.data.message, 'Please provide both email and password');
  });

  it('login controller should require email and password', async () => {
    const { req, res } = createMockReqRes({ body: {} });
    await authController.login(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.data.message, 'Please provide both email and password');
  });

  it('Bcrypt should hash passwords and verify successfully', async () => {
    const rawPassword = 'SecretPassword123!';
    const saltRounds = 10;
    const hash = await bcrypt.hash(rawPassword, saltRounds);

    assert.notStrictEqual(hash, rawPassword, 'Hash should not be equal to plain text');
    assert.ok(hash.startsWith('$2'), 'Bcrypt hash should start with $2');

    const isMatch = await bcrypt.compare(rawPassword, hash);
    assert.strictEqual(isMatch, true, 'Bcrypt compare should return true for correct password');

    const isWrongMatch = await bcrypt.compare('WrongPassword', hash);
    assert.strictEqual(isWrongMatch, false, 'Bcrypt compare should return false for incorrect password');
  });

  it('JWT should sign and verify tokens with user payload', () => {
    const secret = 'test_secret_key';
    const payload = { id: new mongoose.Types.ObjectId().toString(), email: 'student@example.com' };

    const token = jwt.sign(payload, secret, { expiresIn: '1h' });
    assert.ok(typeof token === 'string', 'Token should be a string');

    const decoded = jwt.verify(token, secret);
    assert.strictEqual(decoded.id, payload.id);
    assert.strictEqual(decoded.email, payload.email);
  });

  it('protect middleware should reject requests without token', async () => {
    const { req, res } = createMockReqRes({ headers: {} });
    let nextCalled = false;
    await protect(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.data.message, 'Not authorized, no token provided');
  });
});

describe('Express App Route Mounting Structure', () => {
  it('App should have router mounted for /api/categories, /api/courses, /api/auth', () => {
    const routerLayers = app.router.stack.filter((layer) => layer.name === 'router');
    assert.strictEqual(routerLayers.length, 3, 'Should have 3 sub-routers mounted');

    const matchesCategory = routerLayers.some((layer) => layer.matchers[0]('/api/categories'));
    const matchesCourse = routerLayers.some((layer) => layer.matchers[0]('/api/courses'));
    const matchesAuth = routerLayers.some((layer) => layer.matchers[0]('/api/auth'));

    assert.strictEqual(matchesCategory, true, 'Categories router mounted at /api/categories');
    assert.strictEqual(matchesCourse, true, 'Courses router mounted at /api/courses');
    assert.strictEqual(matchesAuth, true, 'Auth router mounted at /api/auth');
  });
});
