
function download_report()
{
	var facility_id = $("#facility_id").val();
	location.href = '/admin/reports/2?facility_id=' + facility_id;
	return false;
}

var load_reports;
load_reports = function() {

$("#report_download_link_id").click(function() {
  download_report();
});

};

$(document).on('page:change', load_reports);
​
