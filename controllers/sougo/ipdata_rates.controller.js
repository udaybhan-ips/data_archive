var IPDataRate = require('../../models/sougo/iprate');

module.exports = {
  addRates: async function(req, res) {
    try {
        const addRatesRes = await IPDataRate.create(req.body);
        return res.status(200).json({
            message: 'success! rate added sucessfully',
            id: addRatesRes
          });
    } catch (error) {
        return res.status(400).json({
            message: error.message
          });
    }    
  },
  listRates: async function(req, res) {
    try {
        const listRatesRes = await IPDataRate.findAll(req.body);
        return res.status(200).json(listRatesRes);
    } catch (error) {
        return res.status(400).json({
            message: error.message
          });
    }    
  },
  updateRates: async function(req, res) {
    try {
        const listRatesRes = await IPDataRate.updateRates(req.body);
        return res.status(200).json(listRatesRes);
    } catch (error) {
        return res.status(400).json({
            message: error.message
          });
    }    
  },

};