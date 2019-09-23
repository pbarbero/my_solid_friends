// Log the user in on click
const popupUri = 'popup.html';
$('#login button').click(() => solid.auth.popupLogin({ popupUri }));
$('#logout button').click(() => solid.auth.logout());

// Update components to match the user's login status
solid.auth.trackSession(session => {
  const loggedIn = !!session;
  $('#login').toggle(!loggedIn);
  $('#logout').toggle(loggedIn);
  $('#user').text(session && session.webId);

  if (session) {
    $('#user').text(session.webId);
    if (!$('#profile').val())
      $('#profile').val(session.webId);
  }
});