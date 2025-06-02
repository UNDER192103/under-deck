var listReports = [], reportIdViewNow = null;

$(document).ready(async () => {
    $("#submit-report").click(async () => {
        if (DAO.USER) {
            let typeReport = $("#typeReport").val();
            let subject = $("#subjectReport").val();
            let message = $("#messageReport").val();
            if (subject.length > 3 && message.length > 3) {
                $("body").modalLoading('show', false);
                API.App.post('', {
                    _lang: _lang,
                    method: "create-new-report",
                    client_id: DAO.USER ? DAO.USER.client_id : null,
                    token: DAO.USER ? DAO.USER.token : null,
                    type: typeReport,
                    subject: subject,
                    message: message,
                }).then(async (res) => {
                    $("body").modalLoading('hide', false);
                    let data = res.data;
                    if (data.result) {
                        listMysReports();
                        toaster.success(`${getNameTd('.Report_created_successfully')}`);
                        $("#subjectReport").val('');
                        $("#messageReport").val('');
                    } else {
                        toaster.danger(`${getNameTd('.Unable_to_create_your_report')}`);
                    }
                })
                .catch(error => {
                    $("body").modalLoading('hide', false);
                    toaster.danger(`${getNameTd('.Unable_to_create_your_report')}`);
                });
            }
            else {
                toaster.danger(`${getNameTd('.Please_enter_a_subject_and_message')}`);
            }
        }
        else {
            toaster.danger(getNameTd('.this_feature_is_only_available_when_logged_into_an_account_text'));
        }
    });

    $(document).on('click', '#btn-submit-response-report', async () => {
        if(DAO.USER){
            let message = $("#message-response-report").val();
            if (message.length > 3) {
                $("body").modalLoading('show', false);
                API.App.post('', {
                    _lang: _lang,
                    method: "respond-r-report",
                    client_id: DAO.USER ? DAO.USER.client_id : null,
                    token: DAO.USER ? DAO.USER.token : null,
                    report_id: reportIdViewNow,
                    message: message,
                }).then(async (res) => {
                    $("body").modalLoading('hide', false);
                    let data = res.data;
                    if (data.result) {
                        listMysReports();
                        toaster.success(`${getNameTd('.sent_successfully')}`);
                        $("#message-response-report").val('');
                    } else {
                        toaster.danger(`${getNameTd('.Unable_to_send_your_message')}`);
                    }
                })
                .catch(error => {
                    $("body").modalLoading('hide', false);
                    toaster.danger(`${getNameTd('.Unable_to_send_your_message')}`);
                });
            }
            else {
                toaster.danger(`${getNameTd('.Please_enter_a_message')}`);
            }
        }
        else {
            toaster.danger(getNameTd('.this_feature_is_only_available_when_logged_into_an_account_text'));
        }
    });

    listMysReports();
    setInterval(listMysReports, 10000);
});

const listMysReports = async () => {
    API.App.post('', {
        _lang: _lang,
        method: "list-mys-reports",
        client_id: DAO.USER ? DAO.USER.client_id : null,
        token: DAO.USER ? DAO.USER.token : null,
    }).then(async (res) => {
        let data = res.data;
        if (data.result) {
            if (JSON.stringify(listReports) != JSON.stringify(data.result)) {
                listReports = data.result;
                await renderReports();
            }
        }
    });
}


const renderReports = async () => {
    $("#list-mys-reports").html("");
    listReports.forEach(item => {
        $("#list-mys-reports").append(`
            <tr class="hover-color-primary animate__animated animate__headShake">
                <td>${item.report_id}</td>
                <td>${getStatusReport(item)}</td>
                <td>${getNameTd(`.${item.type.replaceAll(' ', '_')}`)}</td>
                <td>${truncate(item.subject, 40)}</td>
                <td>${item.answers.filter(f => f.respByClient_id != item.client_id).length}</td>
                <td>${item.date}</td>
                <td>
                    <a onClick="showMoreInforReport('${item.report_id}')" class="btn btn-light btn-xs view_text">${getNameTd('.view_text')}</a>
                </td>
            </tr>
        `);
        if (reportIdViewNow == item.report_id) {
            $("#iiviewRPP").html(getReportResponses(item));
        }
        if (item == listReports[listReports.length - 1]) {
            setTimeout(() => {
                var table = $('.footable').footable();
                table.trigger('footable_resize');
            }, 500);
        }
    });
}

function getStatusReport(report) {
    switch (report.status) {
        case 'Pending':
            return `<span class="badge text-bg-primary ${report.status}">${getNameTd(`.${report.status}`)}</span>`;
            break;
        
        case 'Waiting for Response':
            return `<span class="badge text-bg-warning ${report.status}">${getNameTd(`.${report.status}`)}</span>`;
            break;
        
        case 'Refused':
            return `<span class="badge text-bg-danger ${report.status}">${getNameTd(`.${report.status}`)}</span>`;
            break;
        
        case 'Approved':
        case 'Completed':
            return `<span class="badge text-bg-success ${report.status}">${getNameTd(`.${report.status}`)}</span>`;
            break;
    
        default:
            return `<span class="badge text-bg-secondary ${report.status}">${getNameTd(`.${report.status}`)}</span>`;
        break;
    }
}

function getReportResponses(report) {
    let html = '';
    report.answers.forEach(answer => {
        let dataStatus = GetStatusAccount(answer.user_answer);
        let tags = GetUserTags(answer.user_answer);
        html += `
            <div class="card theme-card mb-3">
                <div class="card-body">
                    <div class="d-flex align-items-center">
                        <img src="${answer.user_answer.icon}" class="img-thumbnail rounded-circle ${dataStatus.classBg}" style="width: 60px; height: 60px;">
                        <div>
                            <h5 class="m-2 ${answer.user_answer.premium == true ? 'text-warning' : ''}">${answer.user_answer.premium == true ? '<i class="bi bi-stars"></i>' : ''} ${answer.user_answer.account}</h5>
                            <div class="m-2 d-flex">${tags}</div>
                        </div>
                    </div>
                    <p class="card-text">${answer.message}</p>
                    <p class="card-text"><small class="text-muted">${answer.date}</small></p>
                </div>
            </div>
        `;
    });
    return html;
}

const showMoreInforReport = (reportId) => {
    let report = listReports.find(f => f.report_id == reportId);
    if (report) {
        reportIdViewNow = reportId;
        var bbbb = bootbox.dialog({
            title: `${report.subject} - ${report.type}`,
            message: `
            <div id="accordionRM">
               <div class="card theme-card">
                  <div class="card-header" id="headingRM">
                     <h5 class="mb-0">
                        <button class="accordion-button p-2 d-block text-center Message_text full-w" data-bs-toggle="collapse"
                           data-bs-target="#collapseRM" aria-expanded="true" aria-controls="collapseRM">
                           ${getNameTd('.Message_text')}
                        </button>
                     </h5>
                  </div>

                  <div id="collapseRM" class="collapse show" aria-labelledby="headingRM"
                     data-parent="#accordionRM">
                     <div class="card-body">
                        ${report.message}
                     </div>
                  </div>
            </div>

            <div id="accordionRM">
               <div class="card theme-card">
                  <div class="card-header" id="headingRM">
                     <h5 class="mb-0">
                        <button class="accordion-button p-2 d-block text-center responses_text full-w" data-bs-toggle="collapse"
                           data-bs-target="#collapseRRR" aria-expanded="true" aria-controls="collapseRRR">
                           ${getNameTd('.responses_text')}
                        </button>
                     </h5>
                  </div>

                  <div id="collapseRRR" class="collapse show" aria-labelledby="headingRM"
                     data-parent="#accordionRM">
                     <div id="iiviewRPP" class="card-body">
                        ${getReportResponses(report)}
                     </div>
                  </div>
            </div>

            <div class="card theme-card mb-3">
                <div class="card-body">
                    <div class="input mb-1">
                               <label class="col-form-label p-0 Message_text">${getNameTd('.Message_text')}</label>
                       <div class="input-group">
                          <textarea id="message-response-report" style="min-height: 100px;"
                             class="form-control placeholder-message border border-secondary"></textarea>
                       </div>
                    </div>
                
                    <div class="input d-flex justify-content-end">
                       <button id="btn-submit-response-report" class="btn btn-success submit_icon">${getNameTd('.submit_icon')}</button>
                    </div>
                </div>
            </div>
            `,
        });
        $(bbbb).on('click', ".btn-close", () => {
            reportIdViewNow = null;
        });
    }
    else{
        reportIdViewNow = null;
    }
}