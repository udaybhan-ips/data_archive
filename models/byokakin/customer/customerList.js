var db = require('../../../config/database');


module.exports = {
    getFreeDialNumberList: async function ({ free_dial_numbers, carrier, comp_code }) {

        try {
            let where = " WHERE ";
            if ((comp_code == '' || comp_code == undefined) && (carrier == '' || carrier == undefined) && (free_dial_numbers == '' || free_dial_numbers == undefined)) {
                throw new Error('Invalid serach request');
            }

            if (comp_code) {
                where += `cust_code__c = '${comp_code}' AND`;
            }

            if (carrier) {
                where += ` carr_comp__c = '${carrier}' AND`;
            }

            if (free_dial_numbers) {

                let freeDialNumberArr = free_dial_numbers.split(",");
                let freeDialNumbers = "";
                let length = freeDialNumberArr.length - 1;
                freeDialNumberArr.forEach((e, index) => {
                    if (length == index) {
                        freeDialNumbers += `'${e.trim()}'`;
                    } else {
                        freeDialNumbers += `'${e.trim()}',`;
                    }
                })
                where += ` free_numb__c in  (${freeDialNumbers}) `;
            }



            let lastThree = where.slice(where.length - 3);

            if (lastThree === 'AND') {
                where = where.substring(0, where.length - 3)
            }

            const query = `select * from ntt_kddi_freedial_c ${where} `;

            //  console.log("query.."+query)

            const summaryRes = await db.queryByokakin(query, []);

            if (summaryRes.rows) {
                return (summaryRes.rows);
            }
            throw new Error('not found')

        } catch (error) {
            console.log("error in getting free dial number list" + error.message)
            throw new Error(error.message)
        }
    },

    getByokiakinCustomerList: async function () {

        try {

            const query = ``;
            const customerListRes = await db.queryByokakin(query, []);

            if (customerListRes.rows) {
                return (customerListRes.rows);
            }
            throw new Error('not found')

        } catch (error) {
            console.log("error in getting byokakin customer list" + error.message)
            throw new Error(error.message)
        }
    },

    updateByokakinCustomer: async function ({ id, kddi_customer, ntt_customer, ntt_orix_customer, modifiedBy }) {

        try {
            if (!id) {
                throw new Error('Invalid Request!');
            }

            let serviceType = {}
            if (kddi_customer == null || kddi_customer == '' || kddi_customer == undefined || kddi_customer == 'null' || kddi_customer == false)
                serviceType['kddi_customer'] = false;
            else
                serviceType['kddi_customer'] = true;

            if (ntt_customer == null || ntt_customer == '' || ntt_customer == undefined || ntt_customer == 'null' || ntt_customer == false)
                serviceType['ntt_customer'] = false;
            else
                serviceType['ntt_customer'] = true;


            if (ntt_orix_customer == null || ntt_orix_customer == '' || ntt_orix_customer == undefined || ntt_orix_customer == 'null' || ntt_orix_customer == false)
                serviceType['ntt_orix_customer'] = false;
            else
                serviceType['ntt_orix_customer'] = true;


            const query = `update m_customer set service_type ='${JSON.stringify(serviceType)}', upd_id='${modifiedBy}', upd_date=now() where id ='${id}'  `;

            const updateCustomer = await db.query(query, [], true);


          
            if (updateCustomer.rowCount) {
                return (updateCustomer.rowCount);
            }
            throw new Error('not found')

        } catch (error) {
            console.log("error in updating byokakin customer " + error.message)
            throw new Error(error.message)
        }
    },



    addFreeDialNumberList: async function (data) {

        try {
            console.log("data.." + JSON.stringify(data))
            if (data.comp_code == undefined || data.comp_code == '' || data.free_dial_numbers == undefined || data.free_dial_numbers == '') {
                return new Error('Invalid request');
            }

            let freeDialNumberArr = data.free_dial_numbers.split(",");
            let freeDialNumbers = "";
            let length = freeDialNumberArr.length - 1;
            freeDialNumberArr.forEach((e, index) => {
                if (length == index) {
                    freeDialNumbers += `'${e.trim()}'`;
                } else {
                    freeDialNumbers += `'${e.trim()}',`;
                }
            })


            const searchQuery = `select * from ntt_kddi_freedial_c where cust_code__c='${data.comp_code}' AND 
        free_numb__c in (${freeDialNumbers}) and carr_comp__c='${data.carrier}' `;
            console.log("searchQuery.." + (searchQuery))

            const searchRes = await db.queryByokakin(searchQuery);
            if (searchRes && searchRes.rows && searchRes.rows.length > 0) {
                throw new Error("This number number already there... Please go search page!")
            }


            let insertQuery = "";
            let res = [];

            for (let i = 0; i < freeDialNumberArr.length; i++) {
                insertQuery = `insert into ntt_kddi_freedial_c (cust_code__c, carr_comp__c, free_numb__c, regi_name__c, 
                 cust_code, used_star__c, rema_info__c, date_regi__c) Values 
                ('${data.comp_code}','${data.carrier}','${freeDialNumberArr[i]}', '${data.updatedBy}','${parseInt(data.comp_code)}'
                ,'${data.start_date}','${data.remark}',now()) returning id`;

                const insertRes = await db.queryByokakin(insertQuery, []);

                if (insertRes && insertRes.rows && insertRes.rows.length > 0) {
                    res.push(insertRes.rows[0].id)
                }
            }

            return res;

        } catch (error) {
            console.log("error in getting free dial number list" + error.message)
            throw new Error(error.message)
        }
    },


}


