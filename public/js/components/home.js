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
        collection: new ReadingCircleListModel()
      };
    },
    componentDidMount: function() {
      this.refleshBox();
    },
    refleshBox: function(){
      this.state.collection.fetchReadingCircles(
        function(circles){
          this.setState({
            collection: circles
          });
        }.bind(this),
        function(error){
          swal("実施中の輪読の取得に失敗しました", "ブラウザをリロードして再度実行してください", "error");
        }
      );
    },
    render: function() {
      return (
        <div>
          <ReadingCircleStatusView collection={this.state.collection} refleshCallback={this.refleshBox}/>
          <hr/>
          <LaunchReadingCircleView collection={this.state.collection} refleshCallback={this.refleshBox}/>
        </div>
      );
    }
  });

  return HomeContainer;
});
