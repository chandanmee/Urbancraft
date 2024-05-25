const User = require("../models/userModel");

// Function to validate UUID
function validateMySQLId(id) {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[4-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

module.exports = { User, validateMySQLId };
