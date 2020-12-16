create table users (id serial Primary Key, name varchar, email_id varchar, date_added timestamp without time zone Default now());

create table cdr_sonus_rate (rate_id serial Primary key, company_code varchar, carrier_code varchar, 
carrier_name varchar, call_sort varchar, date_start timestamp without time zone , date_expired timestamp without time zone,
rate_setup numeric, rate_second numeric, date_updated timestamp without time zone, currnet_flag integer , date_added timestamp without time zone Default now() )


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
billing_start_date timestamp without time zone, expiry_date timestamp without time zone, date_updated timestamp without time zone, deleted BOOLEAN NOT NULL DEFAULT FALSE );

create table sonus_outbound_rates(id serial, customer_id varchar, landline numeric, mobile numeric, date_added timestamp without time zone);

create table m_customer (id serial, customer_cd varchar, customer_name varchar, post_number integer, address varchar, tel_number varchar,
fax_number integer, email varchar, pay_type integer, staff_name varchar, logo varchar, bcode varchar, upd_id varchar, upd_date timestamp without time zone
, upd_cnt integer)