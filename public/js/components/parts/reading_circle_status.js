/*
* 輪読状況に関する表示用View
*
*
*/
define(['react', "jquery", "underscore", "moment",
        "models/group_member_list", 
        "models/reading_circle_list", 
        "models/reading_circle_member_list"],
function(React, $, _, moment,
         GroupMemberListModel,
         ReadingCircleListModel,
         ReadingCircleMemberListModel){


  var ReadingCircleStatusContainer = React.createClass({
    getInitialState: function() {
      return {
        collection: new ReadingCircleListModel()
      };
    },
    componentDidMount: function() {
      this.refleshBox();
    },
    componentWillReceiveProps: function(nextProps) {
      if(nextProps.updateStatus){
        this.refleshBox();
      }
    },
    componentDidUpdate: function() {
      // リクエストが以上に発生するようになるので使用をやめる
      // お互いの状況が反映されない問題が発生する
      //this.refleshBox();
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
          <div className="row">
            <div className="col-md-12">
              <h1>輪読状況</h1>
            </div>
          </div>
          <br/>
          <ReadingCircleStatusList collection={this.state.collection} 
                                   refleshCallback={this.props.refleshCallback}/>
        </div>
      );
    }
  });

  var ReadingCircleStatusList = React.createClass({
    render: function() {
      var readingCircleStatusNodes = this.props.collection.map(function (_circle) {
        return (
          <ReadingCircleStatus circle={_circle} 
                               key={_circle.id} 
                               refleshCallback={this.props.refleshCallback} />
        );
      }.bind(this));
      return (
        <div>
          <ul>
            {readingCircleStatusNodes}
          </ul>
        </div>
      );
    }
  });

  var ReadingCircleStatus = React.createClass({
    getInitialState: function() {
      return {
        bookTitle: null,
        group: null,
        bookOwner: null,
        members: new ReadingCircleMemberListModel()
      };
    },
    componentDidMount: function() {
      this.refleshBox();
    },
    refleshBox: function(){
      this.setState({
        startDate: this.props.circle.get("start")
      });

      // 書籍情報を取得
      this.props.circle.get("bookTitle").fetch({
        success: function(bookTitle){
          this.setState({
            bookTitle: bookTitle
          })
        }.bind(this),
        error: function(bookTitle, error){
          swal("書籍詳細の取得に失敗しました", "ブラウザをリロードして再度実行してください", "error");
        }
      });

      // 書籍所有者を取得
      this.props.circle.get("bookOwner").fetch({
        success: function(bookOwner){
          this.setState({
            bookOwner: bookOwner
          })
        }.bind(this),
        error: function(bookOwner, error){
          swal("書籍所有詳細の取得に失敗しました", "ブラウザをリロードして再度実行してください", "error");
        }
      });

      // 輪読実施グループを取得
      this.props.circle.get("group").fetch({
        success: function(group){
          this.setState({
            group: group
          })
        }.bind(this),
        error: function(group, error){
          swal("輪読グループの取得に失敗しました", "ブラウザをリロードして再度実行してください", "error");
        }
      });

      // 輪読メンバーを取得
      this.state.members.fetchReadingCircleMembers(this.props.circle,
                                                  function(members){
                                                    this.setState({
                                                      members: members
                                                    })
                                                  }.bind(this),
                                                  function(error){
                                                    swal("輪読グループメンバーの取得に失敗しました", "ブラウザをリロードして再度実行してください", "error");
                                                  }.bind(this));

    },
    finishReadingCircle: function(){

      swal({
        title: "輪読を終了しますか?",
        text: "",
        type: "warning",
        showCancelButton: true,
        confirmButtonClass: "btn-info",
        confirmButtonText: "終了する",
        closeOnConfirm: false
      },
      function(isConfirm){

        this.props.circle.set("finished", true);
        this.props.circle.save({
          success: function(){

            this.state.bookOwner.set("used", false);
            this.state.bookOwner.save({
              success: function(){
                swal("輪読を終了しました", "", "success");
                this.props.refleshCallback();
              }.bind(this),
              error: function(){
                swal("輪読の終了に失敗しました", "再度実行してください", "error");
              }.bind(this)
            })
          }.bind(this),
          error: function(){
            swal("輪読の終了に失敗しました", "再度実行してください", "error");
          }.bind(this)
        })

      }.bind(this));

    },
    render: function() {

      var members = this.state.members;
      var startDate = moment(String(this.props.circle.get("start"))); // 開始日(Moment)
      var cycle = parseInt(this.props.circle.get("cycleDay")); // サイクル日数

      var optionMembers = members.map(function(member, i) {

        var cycleDays = (i == 0) ? 0 : cycle;

        var start = "";
        if(member.isSkip()){
          start = "Skiped";
          startDate = moment(String(member.get("skipedAt"))); // 開始日をリセットする
        }else　if(member.isFinish()){
          start = "Finished";
          startDate = moment(String(member.get("finishedAt"))); // 開始日をリセットする
        }else{
          startDate.add(cycleDays, 'days');
          start = startDate.fromNow();
        }

        return <Member member={member} 
                       key={member.id} 
                       order={i+1} 
                       start={start} 
                       refleshCallback={this.refleshBox}/>
      }.bind(this));

      return (
        <li className="list-group-item">
          <div className="row">
            <div className="col-xs-8">
              {this.state.bookTitle ? <label className="pull-left">{this.state.bookTitle.get("name")}</label> : null }
            </div>
            <div className="col-xs-4">
              {this.state.group ? <label className="pull-right">{this.state.group.get("name")}</label> : null }
            </div>
          </div>
          <br/>
          <ul>
            {optionMembers}
          </ul>
          <br/>
          <CommandList memberManagerCallback={this.handleMemberManagerLink} finishCallback={this.finishReadingCircle}/>
        </li>
      );
    }
  });

  // ****************************************************
  // 各種アクションを行うボタン
  // ****************************************************
  var CommandList = React.createClass({
    render: function() {
      return (
        <div className="row">
          <div className="col-md-12">
            <div className="btn-group pull-right">
              <button className="btn btn-danger" onClick={this.props.finishCallback} >
                <span>輪読終了</span>
              </button>
            </div>
          </div>
        </div>
      );
    }
  });

  var Member = React.createClass({
    getInitialState: function() {
      return {
        user: null
      };
    },
    componentDidMount: function() {
      this.props.member.get("member").fetch({
        success:function(member){

          member.get("user").fetch({
            success:function(user){
              this.setState({
                user: user
              })
            }.bind(this),
            error: function(user, error){
               swal("ユーザ情報が取得できませんでした", "再度実行してください", "error");
            }
          });

        }.bind(this),
        error: function(user, error){
           swal("ユーザ情報が取得できませんでした", "再度実行してください", "error");
        }
      });
    },
    skipReading: function(){
      this.props.member.toSkip(function(){
        swal("スキップしました", "", "success");
        this.props.refleshCallback();
      }.bind(this), 
      function(){
        swal("ステータスの変更に失敗しました", "再度実行してください", "error");
      }.bind(this));

    },
    finishReading: function(){
      this.props.member.toFinish(function(){
        swal("読了しました", "", "success");
        this.props.refleshCallback();
      }.bind(this), 
      function(){
        swal("ステータスの変更に失敗しました", "再度実行してください", "error");
      }.bind(this));

    },
    render: function() {

      var finished = this.props.member.isFinish();
      var skiped= this.props.member.isSkip();
      var finishedClass = finished || skiped ? "list-group-item disabled" : "list-group-item";

      return (
        <li className={finishedClass}>
          <div className="row">
            <div className="col-md-1">
              <span className="label label-primary">{this.props.order}</span>
            </div>
            <div className="col-md-2">
              <span className="label label-primary">{this.props.start}</span>
            </div>
            <div className="col-md-6">
              { this.state.user ? <span>{this.state.user.get("screenname")}</span> : null }
            </div>
            <div className="col-md-3">
              <div className="btn-group">
                { finished || skiped ? null : <button className="btn btn-info btn-xs" onClick={this.finishReading} ><span>読了</span></button> }
                { finished || skiped ? null : <button className="btn btn-warning btn-xs" onClick={this.skipReading} ><span>スキップ</span></button> }
              </div>
            </div>
          </div>
        </li>
      );
    }
  });


  return ReadingCircleStatusContainer;
});
