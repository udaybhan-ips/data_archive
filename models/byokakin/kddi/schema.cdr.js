module.exports = (sequelize, Sequelize) => {
    const CDR = sequelize.define("cdr_202106", {
      cdr_id: {
        type: Sequelize.BIGINT
      },
      date_bill: {
        type: Sequelize.DATE
      },
      orig_ani: {
        type: Sequelize.STRING
      },
      term_ani: {
        type: Sequelize.STRING
      },
      start_time: {
        type: Sequelize.DATE
      },
      stop_time: {
        type: Sequelize.DATE
      },
      duration: {
        type: Sequelize.STRING
      },
      duration_use: {
        type: Sequelize.STRING
      },
      in_outbound: {
        type: Sequelize.STRING
      },
      dom_int_call: {
        type: Sequelize.STRING
      },
      orig_carrier_id: {
        type: Sequelize.STRING
      },
      term_carrier_id: {
        type: Sequelize.STRING
      },
      transit_carrier_id: {
        type: Sequelize.STRING
      },
      selected_carrier_id: {
        type: Sequelize.STRING
      },
      billing_company_code: {
        type: Sequelize.STRING
      },
      trunk_port: {
        type: Sequelize.STRING
      },
      sonus_session_id: {
        type: Sequelize.STRING
      },
      sonus_start_time: {
        type: Sequelize.DATE
      },
      sonus_disconnect_time: {
        type: Sequelize.DATE
      },
      sonus_call_duration: {
        type: Sequelize.STRING
      },
      sonus_call_duration_second: {
        type: Sequelize.STRING
      },
      sonus_anani: {
        type: Sequelize.STRING
      },
      sonus_incallednumber: {
        type: Sequelize.STRING
      },
      sonus_ingressprotocolvariant: {
        type: Sequelize.STRING
      },
      registerdate: {
        type: Sequelize.DATE
      },
      sonus_ingrpstntrunkname: {
        type: Sequelize.STRING
      },
      sonus_gw: {
        type: Sequelize.STRING
      },
      sonus_callstatus: {
        type: Sequelize.STRING
      },
      sonus_callingnumber: {
        type: Sequelize.STRING
      },
      sonus_egcallednumber: {
        type: Sequelize.STRING
      },
      sonus_egrprotovariant: {
        type: Sequelize.STRING
      }
    });
  
    return CDR;
  };