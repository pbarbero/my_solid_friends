const FOAF = $rdf.Namespace('http://xmlns.com/foaf/0.1/'); //vocabulary
const VCARD = new $rdf.Namespace('http://www.w3.org/2006/vcard/ns#'); //ontology

// Log the user in on click
const popupUri = 'popup.html';
$('#login button').click(() => solid.auth.popupLogin({ popupUri }));
$('#btnLogout').click(async function() {
  solid.auth.logout();
  hidePersonalPod();
 }
);

// Update components to match the user's login status
solid.auth.trackSession(session => {
  const loggedIn = !!session;
  $('#login').toggle(!loggedIn);
  $('#logout').toggle(loggedIn);
  $('#user').text(session && session.webId);

  if (session) {
    showPersonalPod(session.webId)
  }
  else {
    hidePersonalPod();
  }
});

$('#view').click(async function loadProfile() {
  // Set up a local data store and associated data fetcher
  const store = $rdf.graph();
  const fetcher = new $rdf.Fetcher(store);

  // Load the person's data into the store
  const person = $('#profile').val();
  await fetcher.load(person);
  let me = $rdf.sym(person);

  showUserDetails(store, me);
  $("#myTabContent").fadeIn(300);
  $("#userTabs").fadeIn(300);
});

$("#showFriends").click(async function loadFriends(){  
  const store = $rdf.graph();
  const fetcher = new $rdf.Fetcher(store);

  // Load the person's data into the store
  const person = $('#profile').val();
  await fetcher.load(person);
  let me = $rdf.sym(person);
  showUserFriends(store, me, fetcher);
});

$("#addFriend").click(async function addFriend(){
  const person = $('#profile').val();
  const store = $rdf.graph();  
  const updater = new $rdf.UpdateManager(store);
  const fetcher = new $rdf.Fetcher(store);
  await fetcher.load(person);
  let me = $rdf.sym(person);
  const friend = $('#newFriend').val().trim();
  let ins = $rdf.st(me, FOAF('knows'), $rdf.sym(friend), me.doc());
  let del = [];
  updater.update(del, ins, (uri, ok, message) => {
    console.log(uri);
    if (ok)
      alert("We're friends now!");
    else
      alert(message);
  });
});

function showUserDetails(store, me){
  const fullName = store.any(me, FOAF('name'));
  var status = store.any(me, FOAF('phone'));
  console.log(status);
  $('#fullName').text(fullName && fullName.value);

  //Display the img
  let picture = getImage(store, me);
  $("#user-img").attr("src", picture.value);  
}

function getImage(store, me){  
  var vcardPhoto = store.any(me, VCARD('hasPhoto'));
  if(vcardPhoto !== undefined)
    return  vcardPhoto;

  return store.any(me, FOAF('image'));
}

function showUserFriends(store, me, fetcher){
  const friends = store.each(me, FOAF('knows'));
  $('#friends').empty();

  friends.forEach(async (urlName) => {
    var urlFriend = urlName.value;

    if(!urlFriend.endsWith("#me")) {
      urlFriend = urlName.value + "#me";
    }
    await fetcher.load(urlFriend);
    let friend = $rdf.sym(urlFriend);
    let image = getImage(store, friend);

    const fullName = store.any(friend, FOAF('name'));
    $('#friends').append(appendFriend(fullName, image, urlFriend));
  });
}

function appendFriend(fullName, image, urlFriend){
  if(image === undefined){
    image = "https://picsum.photos/200/200";
  }  
  else{
    image = image.value;
  } 

  return $('<dt>').append(
    "<div id='user-card' class='card' style='width: 18rem;' >" + 
      "<img src='" + image + "' class='card-img-top'>" + 
      "<div class='card-body'>" + 
      "<h5 class='card-title'>" +fullName +"</h5>" + 
        "<button type='button' class='btn btn-dange' onclick='removeFriend(this)'><i class='fas fa-user-times'></i></button>" + 
        "  <a href='" + urlFriend +"' class='card-text'>"+ urlFriend+ "</a>" + 
      " </div>" + 
    "</div>"
    );
}

function removeFriend(friendId) {
	solid.auth.trackSession(async session => {
		const store = $rdf.graph();
		// const fetcher = new $rdf.Fetcher(store);
		const updater = new $rdf.UpdateManager(store);
		
		var friend = $(friendId).siblings("a").attr("href");
		if (friend.length == 0)
			return;
		
		const myid = session.webId;
		
		const me = $rdf.sym(myid);
		const profile = me.doc();
		
		let ins = [];
		let del = store.statementsMatching(me, FOAF('knows'), $rdf.sym(friend), profile);
		updater.update(del, ins, (uri, ok, message) => {
			if (ok)
				alert('friend deleted');
			else
				alert(message);
		});
	});
}

function showPersonalPod(sessionWebId){
  $("#user").attr("href", sessionWebId);
    if (!$('#profile').val()){
      $('#profile').val(sessionWebId);
    }
    $("#solid-details").show();
    $("#view").show();
    $("#cardLogin").hide();
}

function hidePersonalPod(){
  localStorage.removeItem("solid-auth-client");
  $("#solid-details").hide();
  $("#cardLogin").show();
  $("#view").hide();
  $("#profile").val("");
}