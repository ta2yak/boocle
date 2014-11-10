/*
* Home表示用View
*
*
*/
define(['react', "jquery", "underscore",
        "jsx!components/parts/reading_circle_status",
        "jsx!components/parts/launch_reading_circle",
        "models/reading_circle_list",
        "mixins/authority"],
function(React, $, _, 
         ReadingCircleStatusView,
         LaunchReadingCircleView,
         ReadingCircleListModel,
         AuthorityMixin){

  // ****************************************************
  // Home
  // ****************************************************
  var HomeContainer = React.createClass({
    mixins: [AuthorityMixin],
    render: function() {
      return (
        <HomeBox/>
      );
    }
  });

  // ****************************************************
  // 輪読グループを制御するコンテナ
  // ****************************************************
  var HomeBox = React.createClass({
    getInitialState: function() {
      return {
        updateStatus: false
      };
    },
    refleshBox: function(){
      this.setState({
        updateStatus: true
      })
    },
    render: function() {
      return (
        <div>
          <ReadingCircleStatusView refleshCallback={this.refleshBox} updateStatus={this.state.updateStatus}/>
          <hr/>
          <LaunchReadingCircleView refleshCallback={this.refleshBox} updateStatus={this.state.updateStatus}/>
        </div>
      );
    }
  });

  return HomeContainer;
});
