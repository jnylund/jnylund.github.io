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
