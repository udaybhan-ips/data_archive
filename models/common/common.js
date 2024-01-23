var db = require('../../config/database');
var utility = require('./../../public/javascripts/utility');
var https = require("https");

module.exports = {
    checkIfWeekend: async function (year, month, day){
        let res = false;
        const lastDayOfMonth = new Date(year,month,day);

        // console.log("lastDayOfMonth is .."+lastDayOfMonth)
        // console.log("lastDayOfMonth is .."+lastDayOfMonth.getDay())
    
        if(lastDayOfMonth.getDay() ==0 || lastDayOfMonth.getDay() ==6){
            return true
        }
        return res;
    },
    
    checkIfHoilday: async function (year, month, day, holidayList){
    
        let res = false;

        const resData = holidayList.filter((ele)=>{
            let a = new Date(ele.holiday_date);
            if(a.getFullYear()== year && a.getMonth()==month-1 && a.getDate()==day){
                return true;
            }else{
                return false;
            }

        })
    
        if(resData.length>0){
            return true
        }
        return res;
    },
    
    getHolidayByYear: async function (year) {
        try {
            
            const getHolidayDateQuery = `select * from jp_holiday where to_char(holiday_date::date,'YYYY') ='${year}' `;
            const getHolidayDataRes = await db.query(getHolidayDateQuery, [], true);

            if(getHolidayDataRes && getHolidayDataRes.rows && getHolidayDataRes.rows.length >0 ){
                return getHolidayDataRes.rows;
            }else {
                const res = addHolidayRecords(year);
                return res;
            }

        } catch (err) {
            console.log("Error in fetching holiday..." + err.message);
            throw new Error(err.message)
        }
    }
}



async function addHolidayRecords(year) {
    
    const res = await doPostToDoItem(year);

    if (res && res.holidays && res.holidays.length > 0) {
        for (let i = 0; i < res.holidays.length; i++) {
            const query = `insert into jp_holiday (holiday_date, name) values('${res.holidays[i]['date']}','${res.holidays[i]['name']}')`;
            const resQuery = await db.query(query, [], true);
        }
    }
    return res.holidays;
}


async function doPostToDoItem(year) {

    const options = {
        hostname: 'holidays-jp.shogo82148.com',
        path: `/${year}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    };

    let p = new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            res.setEncoding('utf8');
            let responseBody = '';

            res.on('data', (chunk) => {
                responseBody += chunk;
            });

            res.on('end', () => {
                resolve(JSON.parse(responseBody));
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        // req.write(data)
        req.end();
    });

    return await p;
}

