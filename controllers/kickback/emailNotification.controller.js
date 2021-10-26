

var EmailNotification = require('../../models/kickback/emailNotification');

let internlReport = true;
let externalReport = true;


module.exports = {

  sendEmail: async function (req, res) {
    const dateId = '3';
    try {
      const [Dates, targetDateErr] = await handleError(EmailNotification.getTargetDate(dateId));
      if (targetDateErr) {
        throw new Error('Could not fetch target date');
      }

      const [allKickComp, allKickCompErr] = await handleError(EmailNotification.getAllKickComp(Dates.targetDateWithTimezone));

      if (allKickCompErr) {
        throw new Error('Could not all kick company');

      }

      const [allKickCompEmail, allKickCompEmailErr] = await handleError(EmailNotification.getAllKickCompEmail(Dates.targetDateWithTimezone));

      if (allKickCompEmailErr) {
        throw new Error('Could not all kick company');

      }


      if (externalReport) {

        for(let i=0; i<allKickComp.length;i++){

          const [deleteTrafficSumm, deleteTrafficSummErr] = await handleError(EmailNotification.deleteTrafficSummary(allKickComp[i]['customer_cd'], Dates.targetDateWithTimezone));
          if (deleteTrafficSummErr) {
            throw new Error('error while deleting summary data');
          }
          const [proDataRes, proDataErr] = await handleError(EmailNotification.getTrafficSummary(allKickComp[i]['customer_cd'], Dates.targetDateWithTimezone));
            if (proDataErr) {
              throw new Error('error while fetching data processed data');
            }
            const [insertTrafficSummaryRes, insertTrafficSummaryErr] = await handleError(EmailNotification.insertTrafficSummary(proDataRes, allKickComp[i]['customer_cd'], Dates.targetDateWithTimezone));
            if (insertTrafficSummaryErr) {
              throw new Error('error while inserting data in traffic summary table');
            }

        }


        for (let i = 0; i < allKickCompEmail.length; i++) {

         

          if (allKickCompEmail[i]['email_type'] == 'multiple') {

            const [deleteTrafficSumm, deleteTrafficSummErr] = await handleError(EmailNotification.deleteTrafficSummary(allKickCompEmail[i]['customer_cd'], Dates.targetDateWithTimezone, 'mulitple'));
            if (deleteTrafficSummErr) {
              throw new Error('error while deleting summary data');
            }
            const [proDataRes, proDataErr] = await handleError(EmailNotification.getTrafficSummaryMultiple(allKickCompEmail[i]['customer_cd'], Dates.targetDateWithTimezone));
            if (proDataErr) {
              throw new Error('error while fetching data processed data');
            }
            const [insertTrafficSummaryRes, insertTrafficSummaryErr] = await handleError(EmailNotification.insertTrafficSummaryMultiple(proDataRes, allKickCompEmail[i]['customer_cd'], Dates.targetDateWithTimezone));
            if (insertTrafficSummaryErr) {
              throw new Error('error while inserting data in traffic summary table');
            }


            const [getEmailDetailsRes, getEmailDetailsErr] = await handleError(EmailNotification.getEmailDetails(Dates.targetDateWithTimezone, allKickCompEmail[i]['customer_cd']));
            if (getEmailDetailsErr) {
              throw new Error('error while fetching data processed data');
            }

            for (let j = 0; j < getEmailDetailsRes.length; j++) {




              if (allKickCompEmail[i]['customer_cd'] == '00000720') {
                let procData = '';
                let procData_2 = '';
                let procData_3 = '';

                let mainId = getEmailDetailsRes[j]['main_id'];
                let mainIdArr = mainId.split(",");

                let subTitle = getEmailDetailsRes[j]['sub_title'];
                let subTitleArr = subTitle.split(",");

                console.log("subTitleArr" + JSON.stringify(subTitleArr));

                let h4 = `いつもお世話になっております。, <br /> <br /> KICKBACKトラフィック状況を送信致します。 <br /> <br />
                よろしくお願いします。 <br /><br /> <p style="color:red">※本メールはシステムより自動的に送信されていますので、返信はしないでください。</p> 
        <br />`;
                procData = h4;

                for (let k = 0; k < mainIdArr.length; k++) {

                  const [getSummaryDataRes, getSummaryDataErr] = await handleError(EmailNotification.getSummaryDataMultiple(Dates.targetDateWithTimezone, allKickCompEmail[i]['customer_cd'], mainIdArr[k]));
                  if (getSummaryDataErr) {
                    throw new Error('error while fetching data processed data');
                  }


                  const [createTableRes, createTableErr] = await handleError(EmailNotification.createTableMultiple(getSummaryDataRes, subTitleArr[k]));
                  if (createTableErr) {
                    throw new Error('error while creating table');
                  }

                  procData = procData + createTableRes;

                }
                const [sendEmailRes, sendEmailErr] = await handleError(EmailNotification.sendEmail(procData, getEmailDetailsRes[j]));
                if (sendEmailErr) {
                  throw new Error('error while sending email');
                }

              } else {

                const [getSummaryDataRes, getSummaryDataErr] = await handleError(EmailNotification.getSummaryDataMultiple(Dates.targetDateWithTimezone, allKickCompEmail[i]['customer_cd'], getEmailDetailsRes[j]['main_id']));
                if (getSummaryDataErr) {
                  throw new Error('error while fetching data processed data');
                }


                const [createTableRes, createTableErr] = await handleError(EmailNotification.createTable(getSummaryDataRes, '', getEmailDetailsRes[j]));
                if (createTableErr) {
                  throw new Error('error while creating table');
                }
                const [sendEmailRes, sendEmailErr] = await handleError(EmailNotification.sendEmail(createTableRes, getEmailDetailsRes[j]));
                if (sendEmailErr) {
                  throw new Error('error while sending email');
                }
              }
            }


          } else {
            
            const [getSummaryDataRes, getSummaryDataErr] = await handleError(EmailNotification.getSummaryData(Dates.targetDateWithTimezone, allKickCompEmail[i]['customer_cd']));
            if (getSummaryDataErr) {
              throw new Error('error while fetching data processed data');
            }

            const [createTableRes, createTableErr] = await handleError(EmailNotification.createTable(getSummaryDataRes, allKickCompEmail[i]['title_name'], allKickCompEmail[i]));
            if (createTableErr) {
              throw new Error('error while creating table');
            }
            const [sendEmailRes, sendEmailErr] = await handleError(EmailNotification.sendEmail(createTableRes, allKickCompEmail[i]));
            if (sendEmailErr) {
              throw new Error('error while sending email');
            }
          }

        }
      }

      if (internlReport) {

        const [getAllKickTrafficCompRes, getAllKickTrafficCompErr] = await handleError(EmailNotification.getAllKickTrafficComp(Dates.targetDateWithTimezone));

        if (getAllKickTrafficCompErr) {
          throw new Error('Could not all kick company');

        }

        let getAllTrafficSummaryHTML = "";

        let [proDataAllRes, proDataAllErr] = await handleError(EmailNotification.getAllProTrafficSummaryInternal(Dates.targetDateWithTimezone));
        if (proDataAllErr) {
          throw new Error('error while fetching data processed data');
        }
        let [createTableMultipleRes, createTableMultipleErr] = await handleError(EmailNotification.createTableMultiple(proDataAllRes, 'KICKBACK TRAFFIC 全体'));
        if (createTableMultipleErr) {
          throw new Error('error while creating table');
        }

        let h4 = `KICKBACKトラフィック状況を送信致します。 <br /> <br />
         <br /><br /> <p style="color:red">※本メールはシステムより自動的に送信されていますので、返信はしないでください。</p> 
<br />`;

        getAllTrafficSummaryHTML = h4;
        getAllTrafficSummaryHTML = getAllTrafficSummaryHTML + createTableMultipleRes;

       
        for (let i = 0; i < getAllKickTrafficCompRes.length; i++) {

          let [proDataAllRes, proDataAllErr] = await handleError(EmailNotification.getAllProTrafficSummaryInternal(Dates.targetDateWithTimezone, getAllKickTrafficCompRes[i]['customer_cd']));
          if (proDataAllErr) {
            throw new Error('error while fetching data processed data');
          }
          let title = "";

          

          if (parseInt(getAllKickTrafficCompRes[i]['cell_phone_limit']) == 0 || getAllKickTrafficCompRes[i]['cell_phone_limit'] == 'null' || getAllKickTrafficCompRes[i]['cell_phone_limit'] ==undefined) {
            title = getAllKickTrafficCompRes[i]['customer_name'] + `携帯分数制限（無し）`;
          } else {
            title = getAllKickTrafficCompRes[i]['customer_name'] + `携帯分数制限（${getAllKickTrafficCompRes[i]['cell_phone_limit']}万分）`;
            
          }
          
          
          let [createTableMultipleRes, createTableMultipleErr] = await handleError(EmailNotification.createTableMultiple(proDataAllRes, title));
          if (createTableMultipleErr) {
            throw new Error('error while creating table');
          }
          getAllTrafficSummaryHTML = getAllTrafficSummaryHTML + '<br></br>' + createTableMultipleRes;

        }

        let subject = '10月度 KICKBACK全体トラフィック速報';
        const [sendEmailAllDataRes, sendEmailAllDataErr] = await handleError(EmailNotification.sendEmailAllData(getAllTrafficSummaryHTML, subject));
        if (sendEmailAllDataErr) {
          throw new Error('error while sending email');
        }




        // const [proDataAllRes, proDataAllErr] = await handleError(EmailNotification.getAllProTrafficSummary(Dates.targetDateWithTimezone));
        // if (proDataAllErr) {
        //   throw new Error('error while fetching data processed data');
        // }
        // const [getSummaryDataMysqlRes, getSummaryDataMysqlErr] = await handleError(EmailNotification.getSummaryDataMysql(Dates.targetDateWithTimezone));
        // if (getSummaryDataMysqlErr) {
        //   throw new Error('error while inserting data in traffic summary table');
        // }

        // const [getSummaryDataRes, getSummaryDataErr] = await handleError(EmailNotification.getSummaryData( Dates.targetDateWithTimezone , allKickComp[i]['customer_cd']));
        // if (getSummaryDataErr) {
        //   throw new Error('error while fetching data processed data');
        // }

        // const [createHTMLForAllDataRes, createHTMLForAllDataErr] = await handleError(EmailNotification.createHTMLForAllData(proDataAllRes, getSummaryDataMysqlRes));
        // if (createHTMLForAllDataErr) {
        //   throw new Error('error while creating table');
        // }

        // const [sendEmailAllDataRes, sendEmailAllDataErr] = await handleError(EmailNotification.sendEmailAllData(createHTMLForAllDataRes));
        // if (sendEmailAllDataErr) {
        //   throw new Error('error while sending email');
        // }

      }


      return {
        message: 'success! data inserted sucessfully',
        id: addRatesRes
      };
    } catch (error) {
      return {
        message: error
      };
    }
  },
  sendEmailByApi: async function (req, res) {
    const dateId = '1';
    try {
      const [Dates, targetDateErr] = await handleError(EmailNotification.getTargetDate(dateId));
      if (targetDateErr) {
        return res.status(400).json({
          message: 'Could not fetch target date'
        });
      }

      const [proDataRes, proDataErr] = await handleError(EmailNotification.getSummaryData(Dates.targetDateWithTimezone));
      if (proDataErr) {
        return res.status(400).json({
          message: 'error while fetching data processed data'
        });

      }

      const [rawDataRes, rawDataErr] = await handleError(EmailNotification.getSummaryDataMysql(Dates.targetDateWithTimezone));
      if (rawDataErr) {
        return res.status(400).json({
          message: 'error while fetching raw data'
        });

      }

      const [createTableRes, createTableErr] = await handleError(EmailNotification.createTable(rawDataRes, proDataRes));
      if (createTableErr) {
        return res.status(400).json({
          message: 'error while creating table'
        });

      }

      const [sendEmailRes, sendEmailErr] = await handleError(EmailNotification.sendEmail(createTableRes));
      if (sendEmailErr) {
        return res.status(400).json({
          message: 'error while sending email'
        });

      }

      return res.status(200).json({
        message: 'success! email sent'
      });

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