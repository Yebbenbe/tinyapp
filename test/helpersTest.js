// helpersTest.js
const { getUser, generateRandomString, urlsForUser } = require("../helpers.js");
const { assert } = require("chai");

const testUsers = {
  abcdee: {
    id: "abcdee",
    email: "user@booble.com",
    password: "password",
  }
}

const urlDatabase = {
  111111: {
    longURL: "https://www.lighthouselabs.ca/",
    userID: "abcdee",
  },
  222222: {
    longURL: "https://www.google.com/",
    userID: "abcdee",
  }
};

// getUser tests
describe("getUser", function () {
  it("should return a user with valid email", function () {
    const user = getUser("user@booble.com", testUsers);
    const expectedOutput = "abcdee";
    assert.strictEqual(user.id, expectedOutput);
  });
  it("should return undefined if email is not in database", function () {
    const user = getUser("hannah_montan@google.com", testUsers);
    const expectedOutput = undefined;
    assert.strictEqual(user, expectedOutput);
  });
  it("should return undefined if email is not provided", function () {
    const user = getUser("", testUsers);
    const expectedOutput = undefined;
    assert.strictEqual(user, expectedOutput);
  });
})

// generateRandomString tests
describe("generateRandomString", function () {
  it("should return a string of length 6", function () {
    const randomString = generateRandomString(6);
    assert.strictEqual(randomString.length, 6);
  });
  it("should return a string of length 10", function () {
    const randomString = generateRandomString(10);
    assert.strictEqual(randomString.length, 10);
  });
  it("should return an empty string if length is not provided", function () {
    const randomString = generateRandomString("");
    const expectedOutput = "";
    assert.strictEqual(randomString, expectedOutput);
  });
})

// urlsForUser tests
describe("urlsForUser", function () {
  it("should return an object with urls belonging to a user", function () {
    const userURLs = urlsForUser("abcdee", urlDatabase); // urlDatabase is defined below
    const expectedOutput = {
      111111: "https://www.lighthouselabs.ca/",
      222222: "https://www.google.com/",
    };
    assert.deepEqual(userURLs, expectedOutput);
  });
  it("should return an empty object if user has no urls", function () {
    const userURLs = urlsForUser("hannah_montana", urlDatabase); // urlDatabase is defined below
    const expectedOutput = {};
    assert.deepEqual(userURLs, expectedOutput);
  });
  it("should return an empty object if user is not provided", function () {
    const userURLs = urlsForUser("", urlDatabase); // urlDatabase is defined below
    const expectedOutput = {};
    assert.deepEqual(userURLs, expectedOutput);
  });
})