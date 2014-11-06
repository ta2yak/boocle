/*
* 輪読状況に関する表示用View
*
*
*/
define(['react', "jquery", "underscore", "moment",
        "models/group_member_list", 
        "models/reading_circle_member_list"],
function(React, $, _, moment,
         GroupMemberListModel,
         ReadingCircleMemberListModel){


  var ReadingCircleStatusContainer = React.createClass({
    render: function() {
      return (
        <div>
          <div className="row">
            <div className="col-md-12">
              <h1>輪読状況</h1>
            </div>
          </div>
          <br/>
          <ReadingCircleStatusList collection={this.props.collection} refleshCallback={this.props.refleshCallback}/>
        </div>
      );
    }
  });

  var ReadingCircleStatusList = React.createClass({
    render: function() {
      var readingCircleStatusNodes = this.props.collection.map(function (_circle) {
        return (
          <ReadingCircleStatus circle={_circle} key={_circle.id} refleshCallback={this.props.refleshCallback} />
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
        members: new GroupMemberListModel()
      };
    },
    componentDidMount: function() {
      this.setState({
        startDate: this.props.circle.get("start")
      });

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

      this.props.circle.get("group").fetch({
        success: function(group){
          this.setState({
            group: group
          })

          this.state.members.fetchGroupMembers(group,
                                              function(members){
                                                this.setState({
                                                  members: members
                                                })
                                              }.bind(this),
                                              function(error){
                                                swal("輪読グループメンバーの取得に失敗しました", "ブラウザをリロードして再度実行してください", "error");
                                              }.bind(this));

        }.bind(this),
        error: function(group, error){
          swal("輪読グループの取得に失敗しました", "ブラウザをリロードして再度実行してください", "error");
        }
      });
    },
    handleMemberManagerLink: function(){

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
        startDate.add(cycleDays, 'days');
        return <Member member={member} key={member.id} order={i+1} start={startDate.fromNow()}/>
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
      this.props.member.get("user").fetch({
        success:function(user){
          this.setState({
            user: user
          })
        }.bind(this),
        error: function(user, error){
           swal("ユーザ情報が取得できませんでした", "再度実行してください", "error");
        }
      });
    },
    render: function() {

      return (
        <li className="list-group-item">
          <div className="row">
            <div className="col-md-2">
              <span className="label label-primary">{this.props.start}</span>
            </div>
            <div className="col-md-8">
              { this.state.user ? <span>{this.state.user.get("screenname")}</span> : null }
            </div>
            <span className="badge">{this.props.order}</span>
          </div>
        </li>
      );
    }
  });


  return ReadingCircleStatusContainer;
});
