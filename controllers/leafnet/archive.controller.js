var Rate = require('../../models/leafnet/rate');

module.exports = {
  getData: async function(req, res) {
    try {
        const getTargetData= await getTargetDate(dateId);
        const deleteTargetDate = await deleteTargetDateCDR(getTargetData);
        const getTargetCDRRes = await getTargetCDR(deleteTargetDate);
        const getDataRes = await Rate.create(getTargetCDRRes);

        return res.status(200).json({
            message: 'success! data inserted sucessfully',
            id: addRatesRes
          });
    } catch (error) {
        return res.status(400).json({
            message: error
          });
    }    
  },
}