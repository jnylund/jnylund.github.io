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
