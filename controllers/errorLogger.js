const Error = require("../Models/Error");

const errorLooger = async (data) => {
    
    const errorData = Error(data);

    await errorData.save()

    return;

}

module.exports = errorLooger