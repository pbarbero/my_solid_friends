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
  }
  else {
    $("#solid-details").hide();
  }
});

const FOAF = $rdf.Namespace('http://xmlns.com/foaf/0.1/');
$('#view').click(async function loadProfile() {
  // Set up a local data store and associated data fetcher
  const store = $rdf.graph();
  const fetcher = new $rdf.Fetcher(store);

  // Load the person's data into the store
  const person = $('#profile').val();
  await fetcher.load(person);

  // Display their details
  const fullName = store.any($rdf.sym(person), FOAF('name'));
  $('#fullName').text(fullName && fullName.value);
  $("#user-card").removeAttr("hidden");
  $("#user-card").fadeIn(300);

  //Display the img
  // let picture = store.any(me, VCARD('hasPhoto')) || store.any(me, FOAF(image));
  // console.log(picture);

  // Display their friends
  const friends = store.each($rdf.sym(person), FOAF('knows'));
  $('#friends').empty();
  friends.forEach(async (friend) => {
    await fetcher.load(friend);
    const fullName = store.any(friend, FOAF('name'));
    $('#friends').append(
      $('<li>').append(
        $('<a>').text(fullName && fullName.value || friend.value)
                .click(() => $('#profile').val(friend.value))
                .click(loadProfile)));
  });
});