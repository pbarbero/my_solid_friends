// Log the user in on click
const popupUri = 'popup.html';
$('#login button').click(() => solid.auth.popupLogin({ popupUri }));
$('#logout').click(() => solid.auth.logout() );

// Update components to match the user's login status
solid.auth.trackSession(session => {
  const loggedIn = !!session;
  $('#login').toggle(!loggedIn);
  $('#logout').toggle(loggedIn);
  $('#user').text(session && session.webId);

  if (session) {
    $("#user").attr("href", session.webId);
    if (!$('#profile').val()){
      $('#profile').val(session.webId);
    }
    $("#solid-details").show();
    $("#cardLogin").hide();
  }
  else {
    $("#solid-details").hide();
    $("#cardLogin").show();
  }
});

const FOAF = $rdf.Namespace('http://xmlns.com/foaf/0.1/');
const VCARD = new $rdf.Namespace('http://www.w3.org/2006/vcard/ns#');

$('#view').click(async function loadProfile() {
  // Set up a local data store and associated data fetcher
  const store = $rdf.graph();
  const fetcher = new $rdf.Fetcher(store);

  // Load the person's data into the store
  const person = $('#profile').val();
  await fetcher.load(person);
  let me = $rdf.sym(person);

  showUserDetails(store, me);
  showUserFriends(store, me, fetcher);
});


function showUserDetails(store, me){
  const fullName = store.any(me, FOAF('name'));
  $('#fullName').text(fullName && fullName.value);
  $("#userDetails").fadeIn(300);

  //Display the img
  let picture = getImage(store, me);
  $("#user-img").attr("src", picture.value);  
}

function getImage(store, me){  
  return store.any(me, VCARD('hasPhoto')) || store.any(me, FOAF('image'));
}

function showUserFriends(store, me, fetcher){
  const friends = store.each(me, FOAF('knows'));
  $('#friends').empty();

  friends.forEach(async (urlName) => {
    var urlFriend = urlName.value + "#me";
    await fetcher.load(urlFriend);
    let friend = $rdf.sym(urlFriend);
    let image = getImage(store, friend);

    const fullName = store.any(friend, FOAF('name'));
    $('#friends').append(addFriend(fullName, image, urlFriend));
  });
}

function addFriend(fullName, image, urlFriend){
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
      "  <a href='" + urlFriend +"' class='card-text'>"+ urlFriend+ "</a>" + 
    " </div>" + 
    "</div>"
    );
}