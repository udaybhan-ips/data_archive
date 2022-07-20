create table byokakin_kddi_infinidata_202206 (cdrid bigint, servicecode varchar(30), did varchar(30), usednumber varchar(30), cld varchar(30), calldate varchar(15), calltime varchar(15), callduration varchar(15), source varchar, destination varchar, terminaltype varchar);

create table byokakin_kddi_processedcdr_202205 (cdrid bigint, cdrclassification varchar(10), customercode varchar(10), terminaltype varchar(10),freedialnumber varchar(30), callingnumber varchar(30), calldate varchar(15), calltime varchar(15), callduration varchar(15), cld varchar(30), sourcearea varchar, destinationarea varchar, cdrcallcharge numeric(16,5), callrate  numeric(16,5),finalcallcharge numeric(16,5), vendorcallcharge numeric(16,5) );

create table byokakin_kddi_raw_cdr_202204 (cdrid serial, did varchar(30), freedialnum varchar(30),   cld varchar(30), calldate timestamp without time zone, calltime varchar(15), callduration varchar(15), source varchar, destination varchar, callclassi varchar, calltype varchar, callcharge numeric(16,5), customercode varchar(10));


create table byokakin_ntt_Koteihi_202205 (cdrid serial, did varchar(30), carrier varchar, service_name varchar, amount numeric(16,0),
 TAXCLASSIFICATION varchar, DAILYDISPLAY varchar, date_added timestamp without time zone, carrier_name varchar);

create table ntt_koteihi_bill_summary (id serial, comp_code__c varchar, bill_numb__c varchar, bill_count__c int, 
bill_start__c timestamp without time zone, bill_end__c timestamp without time zone, bill_issue__c timestamp without time zone, 
bill_due__c timestamp without time zone, bill_sum__c numeric(16,2), bill_tax__c numeric(16,2), bill_notax__c numeric(16,2), 
bill_total__c numeric(16,2) )


create table ntt_koteihi_cdr (cdrid serial, COMP_ACCO__C varchar,  KaisenBango varchar, 
RiyouGaisya varchar, SeikyuuUchiwake varchar, Kingaku int, ZeiKubun varchar, HiwariHyouji varchar,  
datebill timestamp without time zone, LINKEDCDRID numeric(16,2))

create table ntt_koteihi_cdr_bill (id serial, cdrid bigint, BILL_CODE varchar,  COMP_ACCO__C varchar, 

BILL_COUNT int, SORT_ORDER int,  KaisenBango varchar, 
RiyouGaisya varchar, SeikyuuUchiwake varchar, Kingaku int, ZeiKubun varchar, HiwariHyouji varchar,  
datebill timestamp without time zone)


create table byokakin_ntt_rawcdr_inbound_202204 (cdrid serial, customername varchar, did varchar(30), calldate timestamp without time zone,
 calltime varchar, callduration varchar(30), callcharge numeric(16,5), callcount104 int, freedialnum varchar(30), 
 source varchar, division varchar,  terminaltype varchar, carriertype varchar);

create table byokakin_ntt_rawcdr_outbound_202204 (cdrid serial, customername varchar, parentdid varchar(30), calltype varchar,
 calldate timestamp without time zone, calltime varchar, cld varchar, destination varchar,  callduration varchar(30), callcharge numeric(16,5),
  callcount104 int, did varchar(30) , carriertype varchar );


create table byokakin_ntt_processedcdr_202204 (cdrid bigint, cdrclassification varchar(10), customercode varchar(10), terminaltype varchar(10),
freedialnumber varchar(30), callingnumber varchar(30), calldate varchar(15), calltime varchar(15), callduration varchar(15), cld varchar(30),
 sourcearea varchar, destinationarea varchar, cdrcallcharge numeric(16,5), callrate  numeric(16,5),finalcallcharge numeric(16,5), 
 vendorcallcharge numeric(16,5) , callcount104 int, carriertype varchar );
