// Global varaible to store fetched items, so we can easily filter it multiple times
var fetchedItems = null;
// Global variable to store the current filter set based on applied filters.
var currentFilter = null;
// Global hash to store ids of users and their names
var people = {};

// Component to show an activity item returned from unfuddle.
var Item = React.createClass({
  removeRecord: function(e){
      this.props.handleItemRemove(this);
  },
  render: function() {
        var extraData = "";
        // Some items have various extra data, this is to grab this data by item type.
        // Could probably be a case statement.
        if(this.props.record_type === "Comment")
          extraData = this.props.record.comment.body;
        if(this.props.record_type === "Changeset")
            extraData = this.props.record.changeset.message;
        if(this.props.record_type === "Ticket")
            extraData = this.props.record.ticket.summary;

        var personName = "";
        // some items dont have associated people
        if (people[this.props.person_id] != null)
          personName = people[this.props.person_id];

        return (
            <tr>
              <td >{this.props.event}:</td>
              <td>{this.props.description}</td>
              <td >{personName}({this.props.person_id})</td>
              <td >{this.props.record_type}:</td>
              <td >{this.props.record_id}:</td>
              <td >{extraData}:</td>

            </tr>
    );
  }
});

// The container of all components
var ItemBox = React.createClass({
  // Loads all the items from the server
  loadItemsFromServer: function(reqFormData) {
    var authString = reqFormData.userName + ":" + reqFormData.password;
    var encoded_auth = window.btoa(authString);
    var projectUrl = "projects/" + reqFormData.projectId + "/activity?start_date=" + reqFormData.startDate + "&end_date=" + reqFormData.endDate;
    var urlBase = "https://" + reqFormData.subDomain + "." + this.props.url;
    var fullUrl = urlBase + projectUrl;

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
      self.setState({data: fetchedItems});
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
  getInitialState: function() {
    return {data: []};
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
          data={this.state.data}
        />
      </div>
    );
  }
});
// Component to render list of items.
var ItemList = React.createClass({
  render: function() {
   var self = this;
   var itemNodes = this.props.data.map(function(item) {
      var hsr = self.props.onItemRemove;
      return (
        <Item key={item.id}
          id={item.id}
          event={item.event}
          description={item.description}
          person_id={item.person_id}
          record_type ={item.record_type}
          record={item.record}
          >
        </Item>
      );
    });
    return (
      <div className="itemList">
        <table className="table table-striped">
          <tbody>
            <tr>
              <th>Action</th>
              <th>Description</th>
              <th>Person</th>
              <th>Record Type</th>
              <th>Record ID</th>
              <th>Data</th>
            </tr>
            {itemNodes}
          </tbody>
        </table>
      </div>
    );
  }
});
// Component to render item form for fetching data
var ItemForm = React.createClass({
  getInitialState: function() {
    // All this to get 2 dates, one for today, and one for 2 weeks ago.
    // Seems like there should be a cleaner way to do this.
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();
    var endDate = yyyy + "/" + mm + "/" + dd
    today.setDate(today.getDate()-14);
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();
    var startDate = yyyy + "/" + mm + "/" + dd
    var userName = "jnylund";
    var subDomain = "solutionstreet"
    var password = "";
    var projectId = "8";

    return {subDomain: subDomain, startDate: startDate, endDate: endDate, userName: userName, password: password, projectId: projectId};
  },
  // generic handle change function
 handleChange : function (e) {
    // this is a generic handle change function that uses the html id to set the state instead of
    // having a bunch of if statements
    var stateObject = function() {
      var returnObj = {};
      returnObj[this.target.id] = this.target.value;
      return returnObj;
    }.bind(e)();
  this.setState(stateObject);
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var startDate = this.state.startDate;
    var endDate = this.state.endDate;
    var userName = this.state.userName;
    var password = this.state.password;
    var projectId = this.state.projectId;
    var subDomain = this.state.subDomain;
    this.props.onFetchSubmit({subDomain: subDomain, startDate: startDate, endDate: endDate, userName: userName, password: password, projectId: projectId });
  },
  render: function() {

    return (
      <form className="itemForm" onSubmit={this.handleSubmit}>
        <table className="formTable">
          <thead>
            <tr>
              <th>Subdomain</th>
              <th>Username</th>
              <th>Password</th>
              <th>Project Id</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr>
            <td>
              <input
                id='subDomain'
                type="text"
                value={this.state.subDomain}
                onChange={this.handleChange}
              />
            </td>
              <td>
                <input
                  id='userName'
                  type="text"
                  value={this.state.userName}
                  onChange={this.handleChange}
                />
              </td>
              <td>
                <input
                  id='password'
                  type="password"
                  value={this.state.password}
                  onChange={this.handleChange}
                />
              </td>
              <td>
                <input
                  id='projectId'
                  type="text"
                  value={this.state.projectId}
                  onChange={this.handleChange}
                />
              </td>
              <td>
                <input
                  id='startDate'
                  type="text"
                  value={this.state.startDate}
                  onChange={this.handleChange}
                />
              </td>
              <td>
                <input
                  id='endDate'
                  type="text"
                  value={this.state.endDate}
                  onChange={this.handleChange}
                />
              </td>
              <td>
                <input type="submit" value="Fetch" disabled={(!this.state.startDate.length > 0 || !this.state.endDate.length > 0 )} />
              </td>
            </tr>
          </tbody>
        </table>
      </form>
    );
      }
});
// Component to render filter form
var FilterForm = React.createClass({
  getInitialState: function() {
    var actionType = "ALL";
    var showResolved = false;
    var userSelected = "0";

    return {actionType: actionType, showResolved: showResolved, userSelected: userSelected};
  },
 handleChange : function (e) {
    // this is a generic handle change function that uses the html id to set the state instead of
    // having a bunch of if statements
    var stateObject = function() {
      var returnObj = {};
      var retVal = null;
      if (this.target.id === "showResolved")
      {
          retVal = this.target.checked;
      }
      else {
        retVal = this.target.value;
      }
      returnObj[this.target.id] = retVal;
      return returnObj;
    }.bind(e)();
  this.setState(stateObject);
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var actionType = this.state.actionType;
    var showResolved = this.state.showResolved;
    var userSelected = this.state.userSelected;
    this.props.onFilterSubmit({actionType: actionType, showResolved: showResolved, userSelected: userSelected });
  },
  render: function() {

    return (
      <form className="itemForm" onSubmit={this.handleSubmit}>
        <table className="formTable">
          <thead>
            <tr>
              <th>Action Type</th>
              <th>User Selected</th>
              <th>Only Resolved or Closed?</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <select id='actionType' onChange={this.handleChange} >
                  <option value="ALL">ALL</option>
                  <option value="status_update">Status Update</option>
                  <option value="create">Create</option>
                  <option value="reassign">Reassign</option>
                </select>

              </td>
              <td>
                <select id='userSelected' onChange={this.handleChange} >
                  <option value="0">All</option>
                  {
                    Object.keys(people).map(function(val,index) {
                      return <option key={val}
                        value={val} > {people[val]} </option>;
                    })
                  }
                </select>

              </td>
              <td>
                <input
                  id='showResolved'
                  type="checkbox"
                  value={this.state.showResolved}
                  onChange={this.handleChange}
                />
              </td>

              <td>
                <input type="submit" value="Filter" />
              </td>
            </tr>
          </tbody>
        </table>
      </form>
    );
      }
});

ReactDOM.render(
  <ItemBox url="unfuddle.com/api/v1/" />,
  document.getElementById('content')
);
