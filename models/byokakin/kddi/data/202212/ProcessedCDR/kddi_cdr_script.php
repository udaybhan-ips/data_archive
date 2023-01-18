<?php
ini_set('memory_limit', '-1');

   $year = "2022";
   $month = "12";

   $host        = "host = 10.168.11.41";
   $port        = "port = 5432";
   $dbname      = "dbname = sonus_db";
   $dbnameIpsPortal      = "dbname = ips_portal";
   $dbnameBYOKAKIN      = "dbname = byokakin";
   

   $credentials = "user = ips password=ips@12345";

   $db = pg_connect( "$host $port $dbname $credentials"  );
   $dbIpsPortal = pg_connect( "$host $port $dbnameIpsPortal $credentials"  );
   $dbByokakin = pg_connect( "$host $port $dbnameBYOKAKIN $credentials"  );

   if(!$db) {
    echo "Error : Unable to open database\n";
 } else {
    echo "Opened database successfully\n";
 }




    $getCustomerQuery ="select id, customer_cd, customer_name from  m_customer 
    where is_deleted=false and service_type ->> 'kddi_customer' ='true'  order by customer_cd  ";

	echo $getCustomerQuery;

   $ret = pg_query($dbIpsPortal, $getCustomerQuery);
   if(!$ret) {
      echo pg_last_error($dbIpsPortal);
      exit;
   } 
   while($row = pg_fetch_row($ret)) {
      
        $query = "select CDRCLASSIFICATION , CUSTOMERCODE ,TERMINALTYPE, free_dial, calling_number, TO_CHAR(call_date::date,  'yyyy/mm/dd') as  call_date, CALLTIME, CALLDURATION ,cld_number, SOURCEAREA, destination, 
        case when call_distance is NULL then 0 else call_distance::int end, call_rate, final_call_charge, calling_month from (select  CDRCLASSIFICATION , CUSTOMERCODE , TERMINALTYPE , REPLACE(FREEDIALNUMBER, '-','') as free_dial ,
        REPLACE(CALLINGNUMBER,'-','') as calling_number , CALLDATE::date as call_date , CALLTIME, CALLDURATION , REPLACE(CLD,'-','') as cld_number ,
        SOURCEAREA, CASE WHEN TERMINALTYPE!='携帯'  then (case when CDRCLASSIFICATION='INBOUND'
        then (select  distance from locationvsdistance where trim(location)=SOURCEAREA limit 1 )
        else (select  distance from locationvsdistance where trim(location)=DESTINATIONAREA limit 1 )  end) else '0' end as call_distance ,
        CASE WHEN TERMINALTYPE = 'その他 - 税込み' THEN '' ELSE DESTINATIONAREA END as destination,
         CASE WHEN TERMINALTYPE = 'その他 - 税込み' THEN '0' ELSE CALLRATE END as call_rate ,
         FINALCALLCHARGE as final_call_charge ,to_char(calldate::timestamp, 'YYYYMM') as calling_month
         from byokakin_kddi_processedcdr_$year$month where TERMINALTYPE!='その他' and customercode = '$row[1]') as foo order by call_date, CALLTIME ";

	echo "query..".$query;              

       $header = array('通話区分','会社コード番号','端末','FREE DIAL番号','通話元番号','通話日','通話開始時間','通話時間（秒）','通話先番号','発信元地域名','発信先地域名','通話距離(KM)','料金単位','通話料金額(¥)','通話月'); 
       
	$s_header = array('ご利用電話番号','通話開始日時','通話開始時刻','着信電話番号','地域名','通話時間','内線区分','呼種別','通話料'); 
        
        $result =pg_query($dbByokakin, $query);
       
       #1000000901_202205CDR_株式会社コミュニケーションビジネスアヴェニューNTT 
        $data = pg_fetch_all($result);
        
	$filename="10{$row[1]}_{$year}{$month}_{$row[2]}KDDI.csv";
	$s_filename="10{$row[1]}_{$year}{$month}_{$row[2]}KDDIその他.csv";
                

        echo $filename;


	$sonotaQuery = "select CALLINGNUMBER , TO_CHAR(calldate::date,  'yyyy/mm/dd') as CALLDATE, CALLTIME, CLD , CASE WHEN TERMINALTYPE = 'その他 - 税込み' THEN '' ELSE DESTINATIONAREA END, TO_CHAR(callduration::interval, 'HH24:MI:SS') as  CALLDURATION, '外線' as \"内線区分\" ,  'ナビダイヤル' as \"呼種別\", FINALCALLCHARGE from byokakin_kddi_processedcdr_$year$month  where TERMINALTYPE='その他' and customercode = '$row[1]' order by CALLDATE, CALLTIME";

	$sonotaResult =pg_query($dbByokakin, $sonotaQuery);
	$sonotaData = pg_fetch_all($sonotaResult);
	

	if($data){
	        genrateCSV($data,$filename, $header);
	}
	if($sonotaData){

	    genrateCSV($sonotaData,$s_filename, $s_header);
	}

   }
   


function dateFormate($date){
        $time = strtotime($date); // timestamp from RFC 2822
        return  date('Y/m/d H:i:s', $time); // 2014-06-30 10:30:00
}
function genrateCSV($data,$filename, $header){
                $user_CSV[0] = $header;
                $ii=1;

//		mb_convert_encoding($dataVariable, "SJIS-win", "UTF-8");

        //      print_r($data);
                foreach($data as $value){
                        $user_CSV[$ii]=$value;
                        $ii++;
                }


$fp = fopen($filename, 'a');

fwrite($fp, arr2csv($user_CSV));
fclose($fp);
//fputs($fileCSV, chr(0xEF) . chr(0xBB) . chr(0xBF));
//fputcsv($fileCSV, $header);

//foreach ($data as $myField ){
  //  fputcsv($fileCSV, $myField);
//}

//fclose($fileCSV);

//            fputs($output, "\xEF\xBB\xBF"); // UTF-8 BOM !!!!!

//		fputs($filename, chr(0xEF) . chr(0xBB) . chr(0xBF));

  //              header('Content-Encoding: Shift_JIS');
    //            header('Content-type: text/csv; charset=Shift_JIS');
      //          header('Content-Disposition: attachment; filename='.$filename);
 //               $fp = fopen($filename, 'w');
    //             $fp = fopen("php://output", "w");
   //         fputs($fp, "\xEF\xBB\xBF"); // UTF-8 BOM !!!!!
    
     //           foreach ($user_CSV as $fields) {
       //                     fputcsv($fp, $fields);
         //               }
    
           //     fclose($fp);
    
        }
   
function arr2csv($fields) {
    $fp = fopen('php://temp', 'r+b');
    foreach($fields as $field) {
        fputcsv($fp, $field);
    }
    rewind($fp);
    $tmp = str_replace(PHP_EOL, "\r\n", stream_get_contents($fp));
    return mb_convert_encoding($tmp, 'SJIS-win', 'UTF-8');
}
 
    
        echo "Operation done successfully\n";
        pg_close($db);
        pg_close($dbIpsPortal);
        pg_close($dbByokakin);
?>    
