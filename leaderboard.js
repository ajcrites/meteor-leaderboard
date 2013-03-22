// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".

Players = new Meteor.Collection("players");

Players.initialize = function () {
    if (Players.find().count() === 0) {
      var names = ["Ada Lovelace",
                   "Grace Hopper",
                   "Marie Curie",
                   "Carl Friedrich Gauss",
                   "Nikola Tesla",
                   "Claude Shannon"];
      for (var i = 0; i < names.length; i++)
        Players.insert({name: names[i], score: Math.floor(Random.fraction()*10)*5});
    }
}

Sorter = {
    orders: {
        score: {score: -1, name: 1},
        name: {name: 1, score: -1}
    },
    order: 'score'
};

if (Meteor.isClient) {
    Session.set("sorter", Sorter);
  Template.leaderboard.players = function () {
    var sorter = Session.get("sorter");
    return Players.find({}, {sort: sorter.orders[sorter.order]});
  };

  Template.leaderboard.selected_name = function () {
    var player = Players.findOne(Session.get("selected_player"));
    return player && player.name;
  };

  Template.player.selected = function () {
    return Session.equals("selected_player", this._id) ? "selected" : '';
  };

  Template.leaderboard.sort_text = function () {
      var text;
      if (Session.get("sorter").order == "score") {
          text = "name";
      }
      else {
          text = "score";
      }
    return "Sort by " + text;
  }

  Template.leaderboard.events({
    'click input.inc': function () {
      Players.update(Session.get("selected_player"), {$inc: {score: 5}});
    },
    'click input.sort': function () {
        var sorter = Session.get("sorter");
        if (sorter.order == "score") {
            sorter.order = "name";
        }
        else {
            sorter.order = "score";
        }
        Session.set("sorter", sorter);
    },
    'click input.reset': function () {
        Meteor.call('reset');
    }
  });

  Template.player.events({
    'click': function () {
      Session.set("selected_player", this._id);
    }
  });
}

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
  Meteor.startup(function () {
      Players.initialize();

      Meteor.methods({
        reset: function () {
            Players.remove({});
            Players.initialize();
        }
      });
  });
}
