var events = [
  {title:"Freshers' Blitz Night", date:"2026-10-22", type:"Tournament", place:"Prefab Block", desc:"Fast 5-minute games to welcome new members. No rating needed."},
  {title:"Opening Tactics Workshop", date:"2026-10-29", type:"Workshop", place:"Prefab Block", desc:"Three openings every beginner should know, with practice puzzles."},
  {title:"HIT vs University of Zimbabwe", date:"2026-11-07", type:"Match", place:"Away - venue to be confirmed", desc:"Team match against another university. Trials are on club night."},
  {title:"End of Semester Rapid Championship", date:"2026-11-20", type:"Tournament", place:"Prefab Block", desc:"The club championship. Swiss format, 15 minutes per player."},
  {title:"Endgame Masterclass", date:"2026-12-03", type:"Workshop", place:"Prefab Block", desc:"King and pawn endgames, step by step, with the club coach."}
];
var MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function parts(iso){ var d = new Date(iso + "T00:00:00"); return {day:d.getDate(), mon:MONTHS[d.getMonth()], obj:d}; }

var board = {
  start: ["rnbqkbnr","pppppppp","........","........","........","........","PPPPPPPP","RNBQKBNR"],
  glyph: {p:"\u265F",n:"\u265E",b:"\u265D",r:"\u265C",q:"\u265B",k:"\u265A"},
  names: {p:"pawn",n:"knight",b:"bishop",r:"rook",q:"queen",k:"king"},
  selected: null
};

function buildBoard(){
  var el = document.getElementById("board");
  if(!el) return;
  var files = "abcdefgh";
  for(var r = 0; r < 8; r++){
    for(var c = 0; c < 8; c++){
      var ch = board.start[r].charAt(c);
      var sq = document.createElement("div");
      sq.className = "sq " + ((r + c) % 2 === 0 ? "l" : "d");
      sq.dataset.name = files.charAt(c) + (8 - r);
      if(ch !== "."){
        var low = ch.toLowerCase();
        sq.textContent = board.glyph[low];
        sq.dataset.piece = board.names[low];
        if(ch === ch.toUpperCase()) sq.classList.add("w");
      }
      sq.onclick = function(){ clickSquare(this); };
      el.appendChild(sq);
    }
  }
}

function clickSquare(sq){
  var info = document.getElementById("board-info");
  if(board.selected && board.selected !== sq){
    // move the selected piece here
    sq.textContent = board.selected.textContent;
    sq.dataset.piece = board.selected.dataset.piece;
    sq.classList.toggle("w", board.selected.classList.contains("w"));
    info.textContent = "Moved to " + sq.dataset.name + ".";
    board.selected.textContent = "";
    delete board.selected.dataset.piece;
    board.selected.classList.remove("sel","w");
    board.selected = null;
    return;
  }
  if(board.selected === sq){ sq.classList.remove("sel"); board.selected = null; info.textContent = "Click any square."; return; }
  if(sq.dataset.piece){
    sq.classList.add("sel");
    board.selected = sq;
    info.textContent = "Selected the " + sq.dataset.piece + " on " + sq.dataset.name + ". Click a square to move it.";
  } else {
    info.textContent = "Square " + sq.dataset.name + " is empty.";
  }
}

function showNextEvent(){
  var box = document.getElementById("next-event");
  if(!box) return;
  var today = new Date(); today.setHours(0,0,0,0);
  var next = null;
  for(var i = 0; i < events.length; i++){
    if(parts(events[i].date).obj >= today){ next = events[i]; break; }
  }
  if(!next){ box.innerHTML = "No events are scheduled right now. <a href='join.html'>Join the club</a> to hear about the next one."; return; }
  var p = parts(next.date);
  box.innerHTML = "<h3 style='margin:0 0 .3rem'>" + next.title + "</h3><p style='margin:0'>" +
    p.day + " " + p.mon + " &middot; " + next.place + "</p><p style='margin:.4rem 0 0'>" + next.desc + "</p>";
}

function renderEvents(filter){
  var list = document.getElementById("event-list");
  if(!list) return;
  list.innerHTML = "";
  var shown = 0;
  for(var i = 0; i < events.length; i++){
    var e = events[i];
    if(filter !== "All" && e.type !== filter) continue;
    var p = parts(e.date);
    var div = document.createElement("div");
    div.className = "event";
    div.innerHTML = "<div class='date'><b>" + p.day + "</b>" + p.mon + "</div>" +
      "<div><h3>" + e.title + "</h3><span class='tag'>" + e.type + "</span>" +
      "<p><strong>Where:</strong> " + e.place + "</p><p>" + e.desc + "</p></div>";
    list.appendChild(div);
    shown++;
  }
  if(shown === 0) list.textContent = "No events of this type yet.";
}

function buildFilters(){
  var box = document.getElementById("filters");
  if(!box) return;
  var types = ["All"];
  for(var i = 0; i < events.length; i++){
    if(types.indexOf(events[i].type) === -1) types.push(events[i].type);
  }
  types.forEach(function(t){
    var b = document.createElement("button");
    b.textContent = t;
    if(t === "All") b.className = "on";
    b.onclick = function(){
      var all = box.querySelectorAll("button");
      for(var k = 0; k < all.length; k++) all[k].classList.remove("on");
      b.classList.add("on");
      renderEvents(t);
    };
    box.appendChild(b);
  });
  renderEvents("All");
}

var photos = [
  {caption:"Freshers' Blitz 2025", piece:"\u265E", color:"#26385f", img:"images/freshers blitz2.jpg"},
  {caption:"Club night at the Student Centre", piece:"\u265B", color:"#6b8cae", img:"images/club night.jpg"},
  {caption:"Beginner coaching session", piece:"\u265F", color:"#3d5a80", img:"images/coaching.jpg"},
  {caption:"Rapid championship final", piece:"\u265A", color:"#14213d", img:"images/final.jpg"},
  {caption:"Away match squad", piece:"\u265C", color:"#4b6a94", img:"images/squad.jpg"},
  {caption:"Puzzle Saturday", piece:"\u265D", color:"#2f4770", img:"images/puzzle.jpg"}
];

function buildGallery(){
  var g = document.getElementById("gallery");
  if(!g) return;
  photos.forEach(function(ph){
    var fig = document.createElement("figure");
    fig.tabIndex = 0;
    fig.innerHTML = tile(ph, "pic") + "<figcaption>" + ph.caption + "</figcaption>";
    fig.onclick = function(){ openBox(ph); };
    fig.onkeydown = function(ev){ if(ev.key === "Enter") openBox(ph); };
    g.appendChild(fig);
  });
  var lb = document.getElementById("lightbox");
  document.getElementById("lb-close").onclick = function(){ lb.classList.remove("open"); };
  lb.onclick = function(ev){ if(ev.target === lb) lb.classList.remove("open"); };
  document.onkeydown = function(ev){ if(ev.key === "Escape") lb.classList.remove("open"); };
}
function tile(ph, cls){
  if(ph.img) return "<img src='" + ph.img + "' alt='" + ph.caption + "'>";
  return "<div class='" + cls + "' style='background:" + ph.color + "'>" + ph.piece + "</div>";
}
function openBox(ph){
  var big = document.getElementById("lb-big");
  big.innerHTML = ph.img ? "<img src='" + ph.img + "' alt='" + ph.caption + "'>" : "";
  big.style.background = ph.img ? "none" : ph.color;
  if(!ph.img) big.textContent = ph.piece;
  document.getElementById("lb-cap").textContent = ph.caption;
  document.getElementById("lightbox").classList.add("open");
}

function validateForm(){
  var f = document.getElementById("join-form");
  if(!f) return;
  f.onsubmit = function(ev){
    var errors = {};
    var name = f.name.value.trim();
    var regno = f.regno.value.trim();
    var email = f.email.value.trim();
    var phone = f.phone.value.trim();
    var msg = f.message.value.trim();

    if(name.length < 3) errors.name = "Enter your full name (at least 3 characters).";
    if(regno.length < 5) errors.regno = "Enter your student registration number.";
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address, like name@example.com.";
    if(phone !== "" && !/^[0-9+\s-]{7,15}$/.test(phone)) errors.phone = "Use 7-15 digits. You may include + and spaces.";
    if(f.level.value === "") errors.level = "Choose your chess level.";
    if(msg.length < 10) errors.message = "Write at least 10 characters.";

    var fields = ["name","regno","email","phone","level","message"], bad = 0;
    for(var i = 0; i < fields.length; i++){
      var k = fields[i];
      document.getElementById("err-" + k).textContent = errors[k] || "";
      f[k].classList.toggle("bad", !!errors[k]);
      if(errors[k]) bad++;
    }
    if(bad > 0){
      ev.preventDefault();
      f[Object.keys(errors)[0]].focus();
    }
  };
}

window.onload = function(){
  buildBoard(); showNextEvent(); buildFilters(); buildGallery(); validateForm();
};
