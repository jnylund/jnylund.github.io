
// The container of all components
var ItemBox = React.createClass({
  // Loads all the items from the server
  loadItemsFromServer: function(reqFormData) {
    var authString = reqFormData.userName + ":" + reqFormData.password;
    var encoded_auth = window.btoa(authString);
    var projectUrl = "projects/" + reqFormData.projectId + "/activity?start_date=" + reqFormData.startDate + "&end_date=" + reqFormData.endDate;
    var urlBase = "https://" + reqFormData.subDomain + "." + this.props.url;
    var fullUrl = urlBase + projectUrl;
    var fetchedItems = null;
    var people = [];

    self = this;
    // we want to wait for the data to load to we can resolve people before we set state
    var jsPromise = Promise.resolve(
      $.ajax({
        url: fullUrl,
        headers: {"Authorization": "Basic " + encoded_auth},
        dataType: 'json',
        cache: false
      }));

    jsPromise.then(function(data) {
      fetchedItems = data;
      var uniquePersonIds = {}
      for (var z=0;z<fetchedItems.length;z++)
      {
        if (fetchedItems[z].person_id != null)
          uniquePersonIds[fetchedItems[z].person_id] = "";
      }

      var arrayOfPromises = [];
      // get the unique list of people id's and then go get their names from unfuddle
      var uniquePersonIdKeys = Object.keys(uniquePersonIds);
      for (var x=0;x<uniquePersonIdKeys.length;x++)
      {
          var peopleUrl = urlBase + "people/" + uniquePersonIdKeys[x];
          var peoplePromise = Promise.resolve(
            $.ajax({
              url: peopleUrl,
              headers: {"Authorization": "Basic " + encoded_auth},
              dataType: 'json',
              cache: false,
            }));

          arrayOfPromises.push(peoplePromise);
      }


     // wait for all people to be loaded before setting state so names look good
     Promise.all(arrayOfPromises).then(function(arrayOfResults) {
      for(var y=0;y<arrayOfResults.length;y++)
      {
        var data = arrayOfResults[y];
        people[data.id] = data.first_name + " " + data.last_name;
      }
      self.setState({data: fetchedItems, allItems: fetchedItems, people: people});
     });
    }, function(xhrObj) {
      console.error(self.props.url, xhrObj.toString());
    });
  },
  // Handles the filtering of data based on the filter form
  handleFilterSubmit: function(filterOptions)
  {
    currentFilter = [];
    var item = null;

    var toResolvedStr = "to *Resolved*."
    var toClosedStr = "to *Closed*."
    var fetchedItems = this.props.allItems;
    for (var i=0;i<fetchedItems.length;i++)
    {
      item = fetchedItems[i];
      if ((filterOptions.actionType == "ALL" || item.event === filterOptions.actionType) && (filterOptions.userSelected == item.person_id || filterOptions.userSelected == 0))
      {
        if ((filterOptions.showResolved == false) || (filterOptions.showResolved == true && (item.description != null && (item.description.includes(toClosedStr) || item.description.includes(toResolvedStr)))))
        {
          currentFilter.push(item);
        }
      }
    }
    this.setState({data: currentFilter});
  },
  filteredData: function(data){

   return filteredData;
  },
  getInitialState: function() {
    return {data: [], allItems: [], people: []};
  },
 componentDidMount: function() {
  },
  render: function() {
    return (
      <div className="itemBox">
        <div className="panel panel-default">
          <div className="panel-heading">
          Fetch
          </div>
          <div className="panel-body">
            <ItemForm onFetchSubmit={this.loadItemsFromServer} />
          </div>
        </div>
        <div className="panel panel-default">
          <div className="panel-heading">
          Filter
          </div>
          <FilterForm onFilterSubmit={this.handleFilterSubmit} />
        </div>
        <h1>Activity Items</h1>
        <ItemList
        // TODO change this to a function filteredData() that only passes the filtered data down, move if statements for filter to this function.
          data={this.state.data}
          people={this.state.people}
        />
      </div>
    );
  }
});

ReactDOM.render(
  <ItemBox url="unfuddle.com/api/v1/" />,
  document.getElementById('content')
);
