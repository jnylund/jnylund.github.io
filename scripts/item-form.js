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
window.ItemForm = ItemForm;
