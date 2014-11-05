define(['react', "jquery", "underscore", "moment",
        "models/session", "models/book_owner_list", 
        "models/group_list", "models/group_member_list", 
        "models/reading_circle_list", "models/reading_circle_member_list", 
        "mixins/authority"],
function(React, $, _, moment,
         SessionManager, BookOwnerListModel, 
         GroupListModel, GroupMemberListModel,
         ReadingCircleListModel, ReadingCircleMemberListModel, 
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
          <ReadingCircleStatusBox collection={this.state.collection} refleshCallback={this.refleshBox}/>
          <hr/>
          <StartReadingCircleBox collection={this.state.collection} refleshCallback={this.refleshBox}/>
        </div>
      );
    }
  });


  var ReadingCircleStatusBox = React.createClass({
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

  var StartReadingCircleBox = React.createClass({
    render: function() {
      return (
        <div>
          <div className="row">
            <div className="col-md-12">
              <h1>輪読を始める</h1>
            </div>
          </div>
          <br/>
          <StartableBooks collection={this.props.collection} refleshCallback={this.props.refleshCallback}/>
        </div>
      );
    }
  });

  var StartableBooks = React.createClass({
    getInitialState: function() {
      return {
        collection: new BookOwnerListModel()
      };
    },
    componentDidMount: function() {
      console.log("componentDidMount");
      this.refleshBox();
    },
    refleshBox: function(){
      this.state.collection.fetchStartableBooks(
        function(books){
          this.setState({
            collection: books
          })
        }.bind(this),
        function(error){
          swal("輪読可能書籍の取得に失敗しました", "ブラウザをリロードして再度実行してください", "error");
        }
      );
    },
    refleshBoxWithParent: function(){
      this.refleshBox();
      this.props.refleshCallback();      
    },
    render: function() {
      var startableBooksNodes = this.state.collection.map(function (_bookOwner) {
        return (
          <StartableBookRow bookOwner={_bookOwner}　key={_bookOwner.id} collection={this.props.collection} refleshCallback={this.refleshBoxWithParent} />
        );
      }.bind(this));
      return (
        <div>
          <div>
            <table className="table table-condensed table-hover">
              <thead>
                <tr>
                  <th>書籍名</th>
                  <th>所有者</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {startableBooksNodes}
              </tbody>
            </table>
          </div>
          <br/>
        </div>
      );
    }
  });

  var StartableBookRow = React.createClass({
    getInitialState: function() {
      return {
        book: null,
        owner: null,
        groups: new GroupListModel(),
        members: new GroupMemberListModel()
      };
    },
    componentDidMount: function() {
      this.props.bookOwner.get("book").fetch({
        success: function(book){
          this.setState({
            book: book
          })
        }.bind(this),
        error: function(book, error){
          swal("書籍詳細の取得に失敗しました", "ブラウザをリロードして再度実行してください", "error");
        }
      });

      this.props.bookOwner.get("owner").fetch({
        success: function(user){
          this.setState({
            owner: user
          })
        }.bind(this),
        error: function(book, error){
          swal("書籍所有者の取得に失敗しました", "ブラウザをリロードして再度実行してください", "error");
        }
      });

      this.state.groups.fetchJoinedGroups(
        function(groups){
          this.setState({
            groups: groups
          });
          this.refleshMember();
        }.bind(this),
        function(error){
          swal("所属グループの取得に失敗しました", "ブラウザをリロードして再度実行してください", "error");
        }.bind(this));

    },
    refleshMember: function(){
      var groupId = this.refs.group.getDOMNode().value;
      var group = this.state.groups.find(function(group){
                                              return group.id === groupId;
                                            });
      this.state.members.fetchGroupMembers(group, 
                                           function(members){
                                              this.setState({
                                                members: members
                                              })
                                           }.bind(this), 
                                           function(error){
                                              swal("グループメンバーの取得に失敗しました", "ブラウザをリロードして再度実行してください", "error");
                                           }.bind(this));
    },
    handleStart: function(e){
      var book = this.state.book;
      var groupId = this.refs.group.getDOMNode().value;
      var group = this.state.groups.find(function(group){
                                              return group.id === groupId;
                                            });
      var cycleDay = this.refs.cycleDay.getDOMNode().value;

      if (!cycleDay || !(parseInt(cycleDay) > 0)) {
        swal({
          title: "エラー",
          text: "所持期間は必ず整数で入力してください",
          type: "warning",
          showCancelButton: false,
          confirmButtonClass: "btn-danger",
          confirmButtonText: "OK",
          closeOnConfirm: false
        });
        return;
      }

      if (parseInt(cycleDay) > 90) {
        swal({
          title: "エラー",
          text: "所持期間は90日以内で入力してください",
          type: "warning",
          showCancelButton: false,
          confirmButtonClass: "btn-danger",
          confirmButtonText: "OK",
          closeOnConfirm: false
        });
        return;
      }

      swal({
        title: "輪読を始めますか?",
        text: "",
        type: "warning",
        showCancelButton: true,
        confirmButtonClass: "btn-info",
        confirmButtonText: "開始する",
        closeOnConfirm: false
      },
      function(isConfirm){
        var _circle = {
          bookTitle: book,
          bookOwner: this.props.bookOwner,
          group: group,
          cycleDay: cycleDay,
          start: new Date(),
          finished: false
        };

        this.props.collection.create(_circle, 
          {
            success:function(obj){
              _circle.bookOwner.set("used", true);
              _circle.bookOwner.save({
                success:function(){

                  var circleMembers = new ReadingCircleMemberListModel();
                  this.state.members.each(function(_member, index){
                    circleMembers.add({
                      circle: obj,
                      member: _member,
                      readingNo: index+1
                    });
                  });

                  Parse.Object.saveAll(circleMembers, {
                    success: function(){
                      $("#" + this.generateModalId()).modal('hide')
                      swal("輪読を開始しました", "", "success");
                      this.props.refleshCallback();
                    }.bind(this),
                    error: function(error){
                      swal("輪読の開始に失敗しました", "時間をおいて再度実行してください", "error");
                    }.bind(this)
                  });

                }.bind(this),
                error:function(){
                  swal("輪読の開始に失敗しました", "時間をおいて再度実行してください", "error");
                }.bind(this)
              })
            }.bind(this),
            error:function(){
              swal("輪読の開始に失敗しました", "時間をおいて再度実行してください", "error");
            }.bind(this)
          }
        );

      }.bind(this));

    },
    generateModalId: function(){
      return "startModal" + (this.state.book ? this.state.book.id : 0);
    },
    render: function() {

      // 一意のIDを生成する
      var dataTarget = "#" + this.generateModalId();
      var dataId     = this.generateModalId();

      var groups = this.state.groups;
      var options = groups.map(function(group, i) {
            return <option value={group.id} key={group.id}>{group.get("name")}</option>
      });

      var members = this.state.members;
      var optionMembers = members.map(function(member, i) {
            return <Member member={member} key={member.id} order={i+1}/>
      });

      return (
        <tr>
          <th>{this.state.book ? this.state.book.get("name") : ""}</th>
          <th>{this.state.owner ? this.state.owner.get("screenname") : ""}</th>
          <th>
            <div>
              <button type="button" className="btn btn-info" data-toggle="modal" data-target={dataTarget}>
                始める
              </button>
              <div className="modal fade" id={dataId} role="dialog" aria-hidden="true">
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <button type="button" className="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span className="sr-only">Close</span></button>
                      <h4 className="modal-title">{this.state.book ? this.state.book.get("name") : ""}</h4>
                    </div>
                    <div className="modal-body">
                      <label>どのグループで輪読を行いますか？</label>
                      <select className="form-control" ref="group" onChange={this.refleshMember}>
                        {options}
                      </select>
                      <hr/>
                      <ul className="list-group">
                        {optionMembers}
                      </ul>
                      <hr/>
                      <div className="form-group">
                        <label>所持期間を設定してください</label>
                        <div className="input-group">
                          <input className="form-control" ref="cycleDay"/>
                          <div className="input-group-addon">日</div>
                        </div>
                      </div>
                      
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-info" onClick={this.handleStart}>開始する</button>
                      <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </th>
        </tr>
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

  return HomeContainer;
});
