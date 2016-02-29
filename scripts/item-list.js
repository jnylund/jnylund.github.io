
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
