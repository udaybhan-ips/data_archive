create table users (id serial Primary Key, name varchar, email_id varchar, date_added timestamp without time zone Default now());

create table cdr_sonus_rate (rate_id serial Primary key, company_code varchar, carrier_code varchar, 
carrier_name varchar, call_sort varchar, date_start timestamp without time zone , date_expired timestamp without time zone,
rate_setup numeric, rate_second numeric, date_updated timestamp without time zone, currnet_flag integer , date_added timestamp without time zone Default now() )


create table cdr_sonus_rate_history (rate_id serial Primary key, company_code varchar, carrier_code varchar, 
carrier_name varchar, call_sort varchar, date_start timestamp without time zone , date_expired timestamp without time zone,
rate_setup numeric, rate_second numeric, date_updated timestamp without time zone, currnet_flag integer , date_added timestamp without time zone Default now() )

 create table sonus_outbound_rates_history (id serial , customer_id varchar , landline numeric , mobile numeric , date_added timestamp without time zone);
 
create table cdr_sonus_billing (bill_id bigint serial, cdr_id bigint not null, rate_id bigint not null, 
bill_number bigint not null, bill_date timestamp without time zone not null, bleg_call_amount numeric not null,
ips_call_amount  numeric not null, remarks varchar not null );

create table cdr_sonus (cdr_id bigint not null, date_bill timestamp without time zone not null, orig_ani varchar,
term_ani varchar, start_time timestamp without time zone, stop_time timestamp without time zone, duration numeric,
duration_use numeric, in_outbound integer, dom_int_call  integer, orig_carrier_id varchar, term_carrier_id varchar,
transit_carrier_id varchar, selected_carrier_id varchar, billing_comp_code varchar, trunk_port varchar, sonus_session_id 
varchar, sonus_start_time timestamp without time zone, sonus_disconnect_time timestamp without time zone, sonus_call_duration
bigint , sonus_call_duration_second bigint, sonus_inani varchar, SONUS_INCALLEDNUMBER varchar, SONUS_INGRESSPROTOCOLVARIANT varchar,
REGISTER_DATE timestamp without time zone, SONUS_INGRPSTNTRUNKNAME varchar, SONUS_GW varchar, SONUS_CALLSTATUS integer,
SONUS_CALLINGNUMBER varchar, SONUS_EGCALLEDNUMBER varchar, SONUS_EGRPROTOVARIANT varchar);

create table batch_date_control (date_id integer serial, date_use varchar, date_set timestamp without time zone,
last_update timestamp without time zone, remarks varchar, deleted BOOLEAN NOT NULL DEFAULT FALSE)


create table sonus_outbound_summary (id serial, service_id integer, raw_cdr_cound bigint, pro_cdr_count bigint, summary_date timestamp without time zone, 
date_updated timestamp without time zone);


create table cdr_sonus_outbound (cdr_id bigint not null, date_bill timestamp without time zone not null, orig_ani varchar,
term_ani varchar, start_time timestamp without time zone, stop_time timestamp without time zone, duration numeric,
duration_use numeric, in_outbound integer, dom_int_call  integer, orig_carrier_id varchar, term_carrier_id varchar,
transit_carrier_id varchar, selected_carrier_id varchar, billing_comp_code varchar, trunk_port varchar, sonus_session_id 
varchar, sonus_start_time timestamp without time zone, sonus_disconnect_time timestamp without time zone, sonus_call_duration
bigint , sonus_call_duration_second bigint, sonus_inani varchar, SONUS_INCALLEDNUMBER varchar, SONUS_INGRESSPROTOCOLVARIANT varchar,
REGISTER_DATE timestamp without time zone, SONUS_INGRPSTNTRUNKNAME varchar, SONUS_GW varchar, SONUS_CALLSTATUS integer,
SONUS_CALLINGNUMBER varchar, SONUS_EGCALLEDNUMBER varchar, SONUS_EGRPROTOVARIANT varchar);


create table cdr_sonus_outbound_billing (bill_id bigint not null, cdr_id bigint not null, rate_id bigint not null, 
bill_number bigint not null, bill_date timestamp without time zone not null, bleg_call_amount numeric not null,
ips_call_amount  numeric not null, remarks varchar not null );


create table sonus_outbound_customer(id serial, customer_name varchar, customer_id varchar, date_added timestamp without time zone,
billing_start_date timestamp without time zone, expiry_date timestamp without time zone,trunk_port varchar, date_updated timestamp without time zone, deleted BOOLEAN NOT NULL DEFAULT FALSE );

create table sonus_outbound_rates(id serial, customer_id varchar, landline numeric, mobile numeric, date_added timestamp without time zone);

create table m_customer (id serial, customer_cd varchar, customer_name varchar, post_number integer, address varchar, tel_number varchar,
fax_number integer, email varchar, pay_type integer, staff_name varchar, logo varchar, bcode varchar, upd_id varchar, upd_date timestamp without time zone
, upd_cnt integer)


 create table cdr_sonus_outbound_summary (id serial, invoice_no integer, customer_name varchar, customer_id varchar, billing_month 
 varchar, billing_year varchar, billing_date timestamp without time zone , update_date timestamp without time zone default now(),
 duration bigint, landline_amt bigint, mobile_amt bigint, total_amt bigint);

create table byokakin_kddi_infinidata_202203 (cdrid bigint, servicecode varchar(30), did varchar(30), usednumber varchar(30), cld varchar(30), calldate varchar(15), calltime varchar(15), callduration varchar(15), source varchar, destination varchar, terminaltype varchar);

create table byokakin_kddi_processedcdr_202203 (cdrid bigint, cdrclassification varchar(10), customercode varchar(10), terminaltype varchar(10),freedialnumber varchar(30), callingnumber varchar(30), calldate varchar, calltime varchar(15), callduration varchar(15), cld varchar(30), sourcearea varchar, destinationarea varchar, cdrcallcharge numeric(16,5), callrate  numeric(16,5),finalcallcharge numeric(16,5), vendorcallcharge numeric(16,5) );

create table byokakin_kddi_raw_cdr_202203 (cdrid serial, did varchar(30), freedialnum varchar(30),   cld varchar(30), calldate timestamp without time zone, calltime varchar(15), callduration varchar(15), source varchar, destination varchar, callclassi varchar, calltype varchar, callcharge numeric(16,5), customercode varchar(10));



update ntt_kddi_freedial_c set free_numb__c ='0120984958' where length(free_numb__c) =14
update ntt_kddi_freedial_c set free_numb__c= '036361094'    where   length(free_numb__c) =15;
 update ntt_kddi_freedial_c set free_numb__c=RIGHT(free_numb__c, 10)  where   length(free_numb__c) =16 and data_idno not in ('55325', '56467', '56471', '57095', '59927');
 update ntt_kddi_freedial_c set free_numb__c= LEFT(free_numb__c, 10)  where   length(free_numb__c) =16 ;
 
 update ntt_kddi_freedial_c set free_numb__c= LEFT(free_numb__c, 10) where   length(free_numb__c) =17 and  data_idno !='58253';
 update ntt_kddi_freedial_c set free_numb__c='0120500778'  where   data_idno ='58253';



 CREATE TABLE IF NOT EXISTS "cdr_202212" ("cdr_id" BIGSERIAL, "date_bill" TIMESTAMP WITHout TIME ZONE not null , orig_ani VARCHAR , term_ani VARCHAR,
 "start_time" TIMESTAMP WITHout TIME ZONE not null , "stop_time" TIMESTAMP WITHout TIME ZONE not null
  ,"duration" VARCHAR(255), "duration_use" VARCHAR(255),
  "dom_int_call" VARCHAR(255), "orig_carrier_id" VARCHAR(255),
 "selected_carrier_id" VARCHAR, "billing_company_code" VARCHAR, "trunk_port" VARCHAR, "sonus_session_id" VARCHAR,
 "sonus_start_time" TIMESTAMP WITHOUT TIME ZONE, "sonus_disconnect_time" TIMESTAMP WITHout TIME ZONE, "sonus_call_duration" VARCHAR,
 "sonus_call_duration_second" VARCHAR, "sonus_anani" VARCHAR, "sonus_incallednumber" VARCHAR, "sonus_ingressprotocolvariant" VARCHAR,
 "registerdate" TIMESTAMP WITHOUT TIME ZONE, "sonus_ingrpstntrunkname" VARCHAR, "sonus_gw" VARCHAR, "sonus_callstatus" VARCHAR,
 "sonus_callingnumber" VARCHAR, "sonus_egcallednumber" VARCHAR, "sonus_egrprotovariant" VARCHAR, "createdAt" TIMESTAMP WITHOUT TIME ZONE ,
 "updatedAt" TIMESTAMP WITHOUT TIME ZONE , in_outbound integer, term_carrier_id varchar, transit_carrier_id varchar, PRIMARY KEY ("cdr_id"));;