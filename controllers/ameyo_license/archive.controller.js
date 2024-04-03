var ArchiveAmeyoLicense = require('../../models/ameyo_license/archive');

module.exports = {
  
  async getLastMonthData(req, res) {
    try {
      const [getLastMonthDataRes, getLastMonthDataResErr] = await handleError(ArchiveAmeyoLicense.getLastMonthData(req.body));
      if (getLastMonthDataResErr) {
        return res.status(500).json({
          message: getLastMonthDataResErr.message
        });
      }
      return res.status(200).json(getLastMonthDataRes);

    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }
  },
  async addMonthlyData(req, res) {
    try {
      const [addMonthlyDataRes, addMonthlyDataErr] = await handleError(ArchiveAmeyoLicense.addMonthlyData(req.body));

      if(addMonthlyDataErr){
        return res.status(500).json({
          message: addMonthlyDataErr.message
        });
      }

      return res.status(200).json(addMonthlyDataRes);

    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }
  },
  async updateMonthlyData(req, res) {
    try {
      const [updateMonthlyDataRes, updateMonthlyDataErr] = await handleError(ArchiveAmeyoLicense.updateMonthlyData(req.body));

      if(updateMonthlyDataErr){
        return res.status(500).json({
          message: updateMonthlyDataErr.message
        });
      }

      return res.status(200).json(updateMonthlyDataRes);

    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }
  }, 

}



const handleError = (promise) => {
  return promise
    .then(data => ([data, undefined]))
    .catch(error => Promise.resolve([undefined, error]));
}