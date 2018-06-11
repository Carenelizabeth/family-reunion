'use strict'

const CURRENT_SESSION = {
    username: '',
    user_id: '',
    user_events: [],
    event: '',
    event_id: '',
    organizer_id: ''
};

const mqMedium = window.matchMedia('(min-width: 500px)');
const mqLarge = window.matchMedia('(min-width: 1000px)');



//Initial set up, allowing user to choose to log in or create a new account
function handleStartButtons(){
    $('.js-log-in').click(e => displayLogin());
    $('.js-make-account').click(e => displayCreateAccount());
}

//mock user login buttons
function handleMockUsers(){
    $('.js-aunt-judy').click(function(e){
        let username = 'Aunt Judy';
        let password = 'judysfunvacation';
        CURRENT_SESSION.username = username;
        handleLogin(username, password);
    })

    $('.js-cousin-bob').click(function(e){
        let username = 'Cousin Bob';
        let password = 'bobsfunvacation';
        CURRENT_SESSION.username = username;
        handleLogin(username, password);
    })

    $('.js-grandma-jo').click(function(e){
        let username = 'Grandma Jo';
        let password = 'josfunvacation';
        CURRENT_SESSION.username = username;
        handleLogin(username, password);
    })

}

function displayLogin(){
    $('.landing-page').addClass('hidden');
    $('.login-page').removeClass('hidden');
    const login = renderLoginForm();
    $('.login-page').html(login);
    handleLoginButton();
}

function displayCreateAccount(){
    $('.landing-page').addClass('hidden');
    $('.login-page').removeClass('hidden');
    const createUser = renderCreateAccount();
    $('.login-page').html(createUser);
    handleNewAccount();
}

//form for loggin in
function renderLoginForm(){
    return`
        <div class='paper orange-border login'>
            <div class='thumb-green'></div>
            <form class='js-login'>
                <fieldset>
                    <legend>Log In</legend>
                    <div class='input-line'> 
                        <label for='login-username'>Username</label>
                        <input type='text' name='login-username' id='login-username' class='login-username' required>
                    </div>
                    <div class='input-line'> 
                        <label for='user-password'>Password</label>
                        <input type='password' name='user-password' id='user-password' required>
                    </div>
                </fieldset>
                <button type='submit' class='js-login-button sticker'>Submit</button>
            </form>
        </div>`
}

//form for creating a new account
function renderCreateAccount(){
    return`
        <div class='paper orange-border login'>
            <div class='thumb-green'></div>
            <form class='js-create-account'>
                <fieldset>
                    <legend>Create New Account</legend>
                    <div class='input-line'> 
                        <label for='create-user-name'>Choose a public user name</label>
                        <input type='text' name='create-user-name' id='create-user-name' required>
                    </div>
                    <div class='input-line'> 
                        <label for='login-email'>Email</label>
                        <input type='text' name='login-email' id='login-email' class='user-email' required>
                    </div>
                    <div class='input-line'> 
                        <label for='user-password'>Password</label>
                        <input type='password' name='user-password' id='user-password' required>
                    </div>
                </fieldset>
                <button type='submit' class='js-create-account-button sticker'>Submit</button>
            </form>
        </div>`
}

//The next section handles user login and displaying their personal events
function handleLoginButton(){

    $('.js-login').submit(function(e){
        e.preventDefault();
        closeModal()
        let username = $(this).find('#login-username').val();
        let password = $(this).find('#user-password').val();
        CURRENT_SESSION.username = username;
        handleLogin(username, password);
        $(this).find('#login-username').val('');
        $(this).find('#user-password').val('');
    });
};

function handleLogin(username, password){
    const data = {username: username,
                password: password}
    $.ajax({
        type: 'POST',
        url: '/auth/login',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: getUserData,
        error: displayLoginError,
        dataType: 'json'
    })
}

//user data is retrieved and then used to retrieve the events that they are registered for
function getUserData(token){
    let authToken = token.authToken;
    $.ajax({
        beforeSend: function(xhr){
            xhr.setRequestHeader(`Authorization`, `Bearer ${authToken}`)
        },
        type: 'GET',
        url: `/user/userdata/${CURRENT_SESSION.username}`,
        contentType: 'application/json',
        success: updateSessionInformation,    
        dataType: 'json'
    })
    .then(pushNewUser)
    .then(getUserEvents)
}

function updateSessionInformation(data){
    CURRENT_SESSION.username = data.username;
    CURRENT_SESSION.user_id = data.id;
}

/*this is mainly for users who have been invited to an event. They may already have registered but not be part of that event.
It will run for all users but will only add their id onto the event if it isn't already there*/
function pushNewUser(){
    let eventId = CURRENT_SESSION.event_id
    const data = {
        id: eventId,
        userId: CURRENT_SESSION.user_id
    }
    if (!eventId == ''){
    $.ajax({
        type: 'PUT',
        url: `/event/adduser/${eventId}`,
        data: JSON.stringify(data),
        contentType: 'application/json',
        dataType: 'json'
    })}
}

function displayLoginError(){
    displayLogin();
    alert('Incorrect username or password');
}

//these next function handle creating a new user account
function handleNewAccount(){
    $('.js-create-account').submit(function(e){
        e.preventDefault();
        closeModal();
        const data = {
            username: $(this).find('#create-user-name').val(),
            email: $(this).find('#login-email').val(),
            password: $(this).find('#user-password').val(),
        }
        createAccount(data);
    })
}

function createAccount(data){
    $.ajax({
        type: 'POST',
        url: '/user',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: updateSessionInformation,
        error: function(err){
            const response=JSON.parse(err.responseText);
            console.log(response.message)
            alert(response.message)
        },
        dataType: 'json'
    })
    .then(pushNewUser)
    .then(getUserEvents)
    .catch(function(err){
        const response=JSON.parse(err.responseText);
        console.log(response.message)
    })
}


//the nav bar is displayed for the first time on the welcome page
function handleNavButtons(){
    $('.nav-welcome').click(e => getUserEvents());
    $('.nav-event').click(e => handleNavEvent());
    $('.nav-logout').click(e => location.reload());
    $('.nav-invite').click(e => handleInvite());
    $('.nav-profile').click(e => showProfilePage());
    $('.nav-details').click(e =>getEventDetails());
}

function getEventDetails(){
    $.ajax({
        type: 'GET',
        url: `/event/${CURRENT_SESSION.event_id}`,
        contentType: 'application/json',
        dataType: 'json',
        success: displayEventDetails
    })
}

function displayEventDetails(results){
    let data=renderEventDetails(results)
    openModal()
    $('.lined-paper').html(data)
    handleEditEventButtons()
}

//If dates and location are presents, they are displayed to the user
//If not, they are prompted to add them. Anyone can edit these
function renderEventDetails(data){
    let edit = 'edit';
    let location;
    let dates;
    if(data.location){location=data.location}
        else{location = `There is no location! Add one now?`, edit = 'add'}
    if(data.dates.length>3){dates=data.dates}
        else{dates = `There are no dates! Add them now?`, edit = 'add'}
    return `
        <h2 class='emphasis'>${CURRENT_SESSION.event}</h2>
        <div class='event-details-section'>                   
            <div class='include-edit'>
                <p class='handwrite'>${location}</p>
                <button type='button' class='edit edit-event-location'>${edit}</button>
            </div>
            <div class='include-edit'>
                <p class='handwrite'>${dates}</p>
                <button type='button' class='edit edit-event-dates'>${edit}</button>
            </div>                    
        </div>`
}

function showProfilePage(){
    $('.js-welcome-page').addClass('hidden');
    $('.js-activity-page').addClass('hidden');
    $('.js-event-page').addClass('hidden');
    $('.js-profile-page').removeClass('hidden');
    populateProfile();
}

function handleNavEvent(){
    let eventId = CURRENT_SESSION.event_id;
    getEventInformation(eventId);
}

function Logout(){
    window.location = window.location.href.split('?')[0];
}


//The next functions generate and display a link that can be used to invite other people to the event
function handleInvite(){
    openModal()
    let link = renderInvite()
    $('.lined-paper').html(link)
    handleCloseInvite()
}

function renderInvite(){
    let inviteURL = getInviteURL()
    return`
        <h3 class='handwrite handwrite-small'>Copy this link to invite friends and family!</h3>
        <div class='link-box'><p>${inviteURL}</p></div>
        <button type='button' class='sticker-green js-close-invite'>Got it!</button>`
}

function getInviteURL(){
    let eventName=CURRENT_SESSION.event.split(' ').join('+');
    let query=`eventId=${CURRENT_SESSION.event_id}&name=${eventName}`
    let inviteURL = `${window.location.protocol}//${window.location.host}?${query}`
    return inviteURL
}

function handleCloseInvite(){
    $('.js-close-invite').click(e => {
        closeModal()
    })
}

//once user logs on, they can choose an event or make a new one
function showWelcomePage(data){
    $('body, html').scrollTop(0);

    if(mqLarge.matches){
        console.log('screen over 1000px')
        $('.js-nav-bar').removeClass('hidden');}

    $('.js-landing-page').addClass('hidden');
    $('.login-page').addClass('hidden');
    $('.js-welcome-page').removeClass('hidden');
    $('.js-event-page').addClass('hidden');    
    $('.js-activity-page').addClass('hidden');
    $('.js-profile-page').addClass('hidden');

    const welcome = renderWelcome();
    $('.welcome-page').html(welcome);

    handleEventButton();
    handleNewEventButton();
}

function renderWelcome(){
    let button = generateEventButtons()
    return`
        <h3 class='title'>WELCOME</h3>
        <div class='paper blue-border welcome-paper'>
            <div class='thumb-yellow'></div>
            <div class='button-section'>

                <p class='handwrite'>My events</p>
                <div class='event-buttons'>
                    ${button.join('')}
                </div>
                <button type='button' class='make-new-event red-sticker'>New Event</button>
            </div>
        </div>`
}

/*the next section makes a call to get events for a registered user, adds them to the
CURRENT_SESSION object and generates a button for each event which are displayed on the Welcome page*/
function getUserEvents(){
    $.ajax({
        type: 'GET',
        url: `/event/byUserId/${CURRENT_SESSION.user_id}`,
        contentType: 'application/json',
        dataType: 'json',
        success: updateUserEvents
    })
}

function updateUserEvents(data){
    if (!(data === undefined || data.length === 0)){
        const events = data.map((item, index) => renderUserEvents(item))
    CURRENT_SESSION.user_events = events;
    }
    showWelcomePage();
}

function renderUserEvents(event){
    const data = {name: event.name,
                  id: event.id}
    return data;
}

function generateEventButtons(){
    let button = []
    if(!(CURRENT_SESSION.user_events.length === 0)){
        for(let i=0; i<CURRENT_SESSION.user_events.length; i++){
            button.push(`<button type='button' class='event-button generate-sticker' id='${CURRENT_SESSION.user_events[i].id}'>${CURRENT_SESSION.user_events[i].name}</button>`)
        }}
    return button;
}

/*this sections handles making a new event, including displaying a form, retrieving information,
posting a new event and displaying the event page*/
function handleNewEventButton(){
    $('.make-new-event').click(e => newEventForm())
}

function newEventForm(){
    openModal();
    const event = renderNewEventForm();
    $('.lined-paper').html(event);
    handleSubmitNewEvent();
}

function renderNewEventForm(){
    return`
    <form class='new-event-form'>
        <fieldset>
            <legend class='handwrite'>Create Your Event</legend>
            <label for='event-name'>Name</label>
            <input type='text' name='event-name' id='event-name'>
            <label for='event-location'>Location</label>
            <input type='text' name='event-location' id='event-location'>
            <label for='event-start-date'>Start date</label>
            <input type='date' name='event-start-date' id='event-start-date'>
            <label for='event-end-date'>End date</label>
            <input type='date' name='event-end-date' id='event-end-date'>
        </fieldset>
        <button type='submit' class='submit-new-event sticker'>Submit</button> 
    </form>`
}

function handleSubmitNewEvent(){
    $('.new-event-form').submit(function(e){
        e.preventDefault();
        let event = {
            event_name: $(this).find('#event-name').val(),
            event_location: $(this).find('#event-location').val(),
            event_dates: {
                start_date: $(this).find('#event-start-date').val(),
                end_date: $(this).find('#event-end-date').val()
            },
            event_organizer: CURRENT_SESSION.user_id,
            event_members: CURRENT_SESSION.user_id
        }
        postNewEvent(event);
    })
}

function postNewEvent(data){
    $.ajax({
        type: 'POST',
        url: '/event',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: showEventPage,
        dataType: 'json'
    })
}

function handleEventButton(){
    $('.event-button').click(function(e){
        let id = this.id;
        getEventInformation(id)
    }) 
}

function getEventInformation(id){
    $.ajax({
        type: 'GET',
        url: `/event/${id}`,
        contentType: 'application/json',
        success: showEventPage,
        dataType: 'json'
    })
}

function showEventPage(data){
    $('body, html').scrollTop(0);

    //if the screen is larger than 1000px, the menu is permanent displayed
    //otherwise, it will be linked to a menu button
    if(!mqLarge.matches){
        $('.control-menu').removeClass('hidden'); 
        $('.menu').removeClass('hidden');
    }

    closeModal();
    $('.js-welcome-page').addClass('hidden');
    $('.js-activity-page').addClass('hidden');
    $('.js-event-page').removeClass('hidden');
    $('.js-profile-page').addClass('hidden');
    $('.nav-button').removeClass('invisible');

    CURRENT_SESSION.event = data.name;
    CURRENT_SESSION.event_id = data.id;
    CURRENT_SESSION.organizer_id = data.organizer;

    let name = data.name;
    let location = data.location;
    let dates = data.dates;
    let id = data.id;

    const event = renderEvent(name, location, dates)
    retrieveActivities(id);
    $('.event-information').html(event);
    handleEditEventButtons();
    handleDeleteEvent();
    handleNewActivity();
    handleDetailsButton();

    //only the event organizer has the ability to delete or change the name of the event
    //the buttons don't appear for anyone else
    if(CURRENT_SESSION.user_id === CURRENT_SESSION.organizer_id){
        $('.include-edit').hover(function(){
            $(this).find('button').removeClass('invisible');
        }, function(){
            $(this).find('button').addClass('invisible');
        });}
}

//these functions handle the nav bar for smaller screens
function handleMenuButton(){
    $('.menu').click(function(e){
        $('.js-nav-bar').removeClass('hidden');
        $('.menu').addClass('hidden');
        $('.close-menu').removeClass('hidden');
    })
}

function handleMenuClose(){
    $('.close-menu').click(function(e){
        $('.js-nav-bar').addClass('hidden');
        $('.menu').removeClass('hidden');
        $('.close-menu').addClass('hidden');
    })
}

function renderEvent(name, location, dates){
    let edit = 'edit';
    if(location){location=location}
        else{location = `Add a location?`, edit = 'add'}
    if(dates.length>1){dates=dates}
        else{dates = `Add the dates?`, edit = 'add'}

    return`           
        <div class='include-edit'>
            <h2 class='event-name title'>${name}</h2>
            <div class='event-button-section'>
                <button type='button' class='js-delete-event not-organizer invisible sticker'>Delete</button>
                <button type='button' class='edit-event-name edit not-organizer invisible'>Edit</button>  
            </div>
        </div>
        <button type='button' class='js-make-activity make-activity circle-sticker'>New Activity</button>` 
}

function handleDetailsButton(){
    $('.event-information').on('click', '.show-event-details', function(e){
        $('.show-event-details').toggleClass('rotate');
        $('.event-details').toggleClass('hidden');
        $('.edit-hidden').toggleClass('hidden');
        $('collapsed-details').addClass('hidden');
    })
}

//buttons for editing event
function handleEditEventButtons(){
    $('.edit-event-name').click(function(e){
        const name = editEventName();
        $('.lined-paper').html(name);
        openModal();
        handleEditNameButton();
    })
    $('.edit-event-location').click(function(){
        const location = editEventLocation();
        $('.lined-paper').html(location);
        openModal();
        handleEditLocationButton();
    })
    $('.edit-event-dates').click(function(){
        const dates = editEventDates();
        $('.lined-paper').html(dates);
        openModal();
        handleEditDatesButton();
    })
}

//forms for editing individual aspects of the events
function editEventName(){
    return `
        <form class='js-edit-event-name js-edit'>
            <label for='edit-event-name'>Enter new event name</label>
            <input type='text' name='edit-event-name' id='edit-event-name'>
            <button type='submit' class='sticker-green'>Submit</button>
        </form>   
    `
}

function editEventLocation(){
    return `
    <form class='js-edit-event-location js-edit'>
        <label for='edit-event-location'>Enter new event location</label>
        <input type='text' name='edit-event-location' id='edit-event-location'>
        <button type='submit' class='sticker-green'>Submit</button>
    </form>   
`
}

function editEventDates(){
    return `
        <form class='js-edit-event-dates js-edit'>
            <label for='edit-event-dates'>Enter new start date</label>
            <input type='date' name='edit-event-start' id='edit-event-start'>
            <label for='edit-event-dates'>Enter new end date</label>
            <input type='date' name='edit-event-end' id='edit-event-end'>
            <button type='submit' class='sticker-green'>Submit</button>
        </form>   
    `
}

//handle submitting forms
function handleEditNameButton(){
    $('.js-edit-event-name').submit(function(e){
        e.preventDefault();
        const name = {
            id: CURRENT_SESSION.event_id,
            event_name: $(this).find('#edit-event-name').val()
        }
        updateEvent(name);
        closeModal();
    })
}

function handleEditLocationButton(){
    $('.js-edit-event-location').submit(function(e){
        e.preventDefault();
        const location = {
            id: CURRENT_SESSION.event_id,
            event_location: $(this).find('#edit-event-location').val()
        }
        updateEvent(location);
        closeModal();
    })
}

function handleEditDatesButton(){
    $('.js-edit-event-dates').submit(function(e){
        e.preventDefault();
        const dates = {
            id: CURRENT_SESSION.event_id,
            event_dates: {
                start_date: $(this).find('#edit-event-start').val(),
                end_date: $(this).find('#edit-event-end').val()}
        }
        updateEvent(dates);
        closeModal();
    })
}

//update function for all event update forms
function updateEvent(data){
    $.ajax({
        type: 'PUT',
        url: `/event/${CURRENT_SESSION.event_id}`,
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: handleNavEvent,
        dataType: 'json'
    })
}

//delete event but double-check first!
function handleDeleteEvent(){
    $('.js-delete-event').click(e => confirmDelete())
}

function confirmDelete(id){
    let confirm = `
        <h3 class='handwrite'>Are you sure?</h3>
        <p>This action cannot be undone</p>
        <div class='confirm-buttons'>
            <button type='button' class='cancel-delete sticker'>Cancel</button>
            <button type='button' class='yes-delete sticker'>Delete</button>
        </div>`
    openModal()
    $('.lined-paper').html(confirm)
    handleConfirmDelete(id)
    handleCancelDelete()
}

function handleConfirmDelete(id){
    $('.yes-delete').click(function(e){
        if(!($('.js-event-page').hasClass('hidden'))){
            DeleteEvent()
        }else{DeleteActivity(id)}
    })
}

function handleCancelDelete(){
    $('.cancel-delete').click(e => closeModal())
}

function DeleteEvent(){
    $.ajax({
        type: 'DELETE',
        url: `/event/${CURRENT_SESSION.event_id}`,
        contentType: 'application/json',
        success: closeModal(),
        dataType: 'json'
    })
    .then(showWelcomePage)
}

//displays activites that have been created under the event
function retrieveActivities(eventId){

    $.ajax({
        type: 'GET',
        url: `/activity/event/${eventId}`,
        contentType: 'application/json',
        dataType: 'json',
        success: displayActivities
    })
}

function displayActivities(data){
    if(!(data.length==0)){
    const activity = data.map((item, index) => renderActivities(item))
    $('.all-activities').html(activity);
    handleRSVP();}
}

function renderActivities(results){

    //displays free if their are no costs associated: other costs are displayed on details page
    let price = calculateCost(results);
    if(price === 0){price = `<div class='free'></div>`}else{price = `<div></div>`}
    
    let kidNumber = 0;
    let adultNumber = results.adult_number;
    let number;

    //displays total number of people attending. More specifics on the activity page
    if(results.kid_number){
        kidNumber = results.kid_number
    }
    number = kidNumber + adultNumber
    if(number ==1){
        number = `${number} person is`
    }else {number = `${number} people are`}

    //shows kid-friendly if kids are welcome
    let kids = `<div></div>`;
    if(results.kids_welcome===true){kids = `<div class='js-kid-friendly'></div>`}

    //only shows join button if attending    
    let attend;
    if(results.attendees.includes(CURRENT_SESSION.user_id)){
        attend = `<div class='already-going'></div>`
    }else{
        attend = `<button type='button' name='${results.name}' class='js-RSVP sticker-green-circle' id='${results.id}'>Join!</button>`
    }

    //this section gives the activites their random appearance of notes on a bulletin board
    let thumbColorArray = ['thumb-yellow', 'thumb-green', 'thumb-red']
    let borderColorArray = ['light-blue-border', 'yellow-border', 'green-border', 'blue-border']
    let rotateArray = ['rotate-right', 'rotate-left']
    let flexArray = ['flex-grow', 'flex-grow-more', 'flex-grow-most']
    let thumbColor = thumbColorArray[Math.floor(Math.random()*thumbColorArray.length)]
    let borderColor = borderColorArray[Math.floor(Math.random()*borderColorArray.length)]
    let rotate = rotateArray[Math.floor(Math.random()*rotateArray.length)]
    let flex = flexArray[Math.floor(Math.random()*flexArray.length)]

    return `        
        <div class='activity wrapper ${borderColor} ${rotate} ${flex}'>
            <div class='${thumbColor}'></div>
            <button type='button' class='activity-name' id='${results.id}'>${results.name}</button>
            <div class='attending'>
                <p class='fun-text'>${number} going</p>
            </div>
            <div class='extra-info'>                
                ${price}
                ${kids}
            </div>
            ${attend}
         </div>`;
}

function handleNewActivity(){
    $('.js-make-activity').click(e =>{
        openModal();
        const activity = createActivity();
        $('.lined-paper').html(activity);
        handleSubmitNewActivity();
        showPriceInfo();
        showGuestInfo();
        showBasicInfo();
    })
}

function handleActivity(){
    $('.js-event-page').on('click', '.activity-name', function(e){
        let id = this.id
        showActivityPage(id);
    });
};

//form for creating a new activity; appears in modal
//the form is split into three sections to display better and for user ease
function createActivity(){
    return`
            <form class='js-activity-form'>
                <fieldset class='basic-info'>
                    <legend>Provide Activity Information</legend>
                    <div class='input-line'>    
                        <label for='activity-name'>Activity name</label>
                        <input type='text' name='activity-name' id='activity-name' required>
                    </div>
                    <div class='input-line'>    
                        <label for='activity-url'>Website link (opt)</label>
                        <input type='text' name='activity-url' id='activity-url'>
                    </div>
                    <div class='input-line'> 
                        <label>Additional information</label>
                    </div>
                        <textarea class='text-input comments'></textarea>
                    <div class='input-line'> 
                        <label for='activity-date'>Date (optional)</label>
                        <input type='date' name='activity-date' id='activity-date' class='date'>
                    </div>
                    <div class='input-line'> 
                        <label for='activity-time'>Time (optional)</label>
                        <input type='time' name='activity-time' id='activity-time'>
                    </div>
                    <div class='input-line'>    
                        <label for='kid-friendly'>Children under 12?</label>                  
                        <input type='checkbox' name='kid-friendly' id='kid-friendly'>                        
                    </div>
                </fieldset>
                <fieldset class='price-info hidden'>
                    <legend>How much will it cost?</legend>
                    <div class='input-line price-line'> 
                        <input type='number' step='0.01' name='adult-cost' id='adult-cost' placeholder='e.g. 5.00'>
                        <label for='adult-cost'>per adult</label>
                    </div>
                    <div class='input-line price-line'> 
                        <input type='number' step='0.01' name='kid-cost' id='kid-cost' placeholder='e.g. 3.00'>
                        <label for='kid-cost'>per child under 12</label>
                    </div>
                    <div class='input-line price-line'> 
                        <input type='number' step='0.01' name='group-cost' id='group-cost' placeholder='e.g. 80.00'>
                        <label for='group-cost'>per group of</label>
                    </div>
                    <div class='input-line price-line'> 
                        <input type='number' name='group-size' id='group-size' placeholder='e.g. 10'>
                        <label for='group-size'>people</label>
                    </div>
                </fieldset>
                <fieldset class='guest-info hidden'>
                    <legend>Who else are you bringing?</legend>
                    <div class='input-line'>
                        <label for='kids-attending'>Kids (under 12)</label>
                        <input type='number' max='10' min='1' name='kids-attending' id='kids-attending'>
                    </div>
                    <div class='input-line'>
                        <label for='adults-attending'>Adults (aside from you)</label>
                        <input type='number' max='10' min='1' name='adults-attending' id='adults-attending'>
                    </div>
                </fieldset>
                <div class='form-buttons'>
                        <button type='button' class='show-basic-info sticker-green hidden'>Basic</button>
                        <button type='button' class='show-price-info sticker-green'>Price?</button>
                        <button type='button' class='show-guest-info sticker-green'>Details</button>
                    <button type='submit' class='submit-new-activity sticker'>Submit</button>
                </div>
            </form>`
}

//the next functions display and hide the different parts of the form
function showPriceInfo(){
    $('.show-price-info').click(function(){
        $('.basic-info').addClass('hidden')
        $('.price-info').removeClass('hidden')
        $('.guest-info').addClass('hidden')
        $('.show-basic-info').removeClass('hidden')
        $('.show-price-info').addClass('hidden')
        $('.show-guest-info').removeClass('hidden')
    })
}

function showGuestInfo(){
    $('.show-guest-info').click(function(){
        $('.price-info').addClass('hidden')
        $('.guest-info').removeClass('hidden')
        $('.basic-info').addClass('hidden')
        $('.show-basic-info').removeClass('hidden')
        $('.show-price-info').removeClass('hidden')
        $('.show-guest-info').addClass('hidden')
    })
}

function showBasicInfo(){
    $('.show-basic-info').click(function(){
        $('.price-info').addClass('hidden')
        $('.guest-info').addClass('hidden')
        $('.basic-info').removeClass('hidden')
        $('.show-basic-info').addClass('hidden')
        $('.show-price-info').removeClass('hidden')
        $('.show-guest-info').removeClass('hidden')
    })
}

//submitting the activity: many of the values need to be parsed as numbers
//if a number entry is blank, it is entered as a 0
function handleSubmitNewActivity(){
    $('.js-activity-form').on('submit', function(e){
        e.preventDefault();
        let kids = parseInt($(this).find('#kids-attending').val(), 10);
        if(kids){kids=kids}else kids=0;
        let adults = parseInt($(this).find('#adults-attending').val(), 10);
        if(adults){adults=adults}else adults=0; adults++;
        let kidCost = parseFloat($(this).find('#kid-cost').val(), 10);
        if(kidCost){kidCost=kidCost}else kidCost=0;
        let adultCost = parseFloat($(this).find('#adult-cost').val(), 10);
        if(adultCost){adultCost=adultCost}else adultCost=0
        let groupCost = parseFloat($(this).find('#group-cost').val(), 10);
        if(groupCost){groupCost=groupCost}else groupCost=0;
        let groupSize = parseInt($(this).find('#group-size').val(), 10);
        if(groupSize){groupSize=groupSize}else groupSize=0;
        let data = {
            eventId: CURRENT_SESSION.event_id,
            activity_name: $(this).find('#activity-name').val(),
            activity_url: $(this).find('#activity-url').val(),
            activity_date: $(this).find('#activity-date').val(),
            activity_time: $(this).find('#activity-time').val(),
            kids_welcome: $(this).find(`#kid-friendly`).is(':checked'),
            kid_cost: kidCost,
            adult_cost: adultCost,
            group_cost: groupCost,
            group_size: groupSize,
            activity_host: CURRENT_SESSION.user_id,
            host_name: CURRENT_SESSION.username,
            attendees: CURRENT_SESSION.user_id,
            kid_number: kids,
            adult_number: adults,
            activity_comments: $(this).find('.comments').val()
        }
        postNewActivity(data);
        closeModal();
    });
};

function postNewActivity(data){
    $.ajax({
        type: 'POST',
        url: '/activity',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: retrieveActivityId,
        dataType: 'json'
    })
}

function retrieveActivityId(results){
    let id = results.id
    showActivityPage(id)
}

function showActivityPage(id){
    $('.js-event-page').addClass('hidden');
    $('.js-activity-page').removeClass('hidden');
    $('.js-profile-page').addClass('hidden');
    $('body, html').scrollTop(0);
    retrieveActivityData(id)
}

function retrieveActivityData(id){
    $.ajax({
        type: 'GET',
        url: `activity/${id}`,
        contentType: 'application/json',
        success: displayActivityPage,
        dataType: 'json'
    })
}

function displayActivityPage(results){
    const activity = renderActivityPage(results);
    $('.activity-page').html(activity);
    handleRSVP();
    handleSubmitComment();
}

//the activity page shows details and this function only displays those which apply
function renderActivityPage(data){
    let cost = calculateCost(data);
    if(cost === 0){cost = `<div class='free'></div>`}
    const comments = []

    let kids = `<div></div>`;
    if(data.kids_welcome===true){kids = `<div class='js-kid-friendly'></div>`}

    let attend;
    if(data.attendees.includes(CURRENT_SESSION.user_id)){
        attend = `<div class='already-going'></div>`
    }else{
        attend = `<button type='button' name='${data.name}' class='js-RSVP sticker-green-circle circle-sticker-bigger' id='${data.id}'>Join!</button>`
    }

    let date;
    let time = `<p></p>`
    if(data.date){date = `<p>Date: ${data.date}</p>`}else date = `<p>Date and time are flexible</p>`
    if(data.time){time = `<p>Time: ${data.time}</p>`}

    
    for (let i=0; i<data.activity_comments.length; i++){
        let eachComment = `
            <div class='comment'>
                <blockquote>${data.activity_comments[i].comment}</blockquote>
                <cite>${data.activity_comments[i].name}</cite>
            </div>`
        comments.push(eachComment);
    }

    let link=`<p></p>`
    if(data.url){link=`<p><a href=${data.url} target='_blank'>Visit Website</a></p>`};

    return`
        <h2 class='title'>${data.name}</h2>
        <div class='activity-detail-section'>            
            <div class='activity-details paper light-blue-border rotate-left'>
                <div class='thumb-green'></div>
                <div class='activity-content'>
                    <h3 class='handwrite'>Activity details</h3>
                    <p>Host: ${data.host_name} </p>
                    <div class='date-time'>
                        ${date}
                        ${time}
                    </div>                
                    ${cost}
                    ${kids}
                    <div>
                        <p>Who's Going?</p>
                        <p>${data.adult_number} adults ${data.kid_number} kids</p>
                    </div>
                    ${attend}
                    ${link}
                </div>
            </div>
            <div class='activity-discussion paper green-border rotate-right'>
                <div class='thumb-yellow'></div>
                <form class= 'comment-section'>
                    <h3 class='handwrite'>Join the discussion!</h3>
                    ${comments.join('')}
                    <textarea class='text-input'></textarea>
                    <button type='submit' class='submit-comment text-area sticker' name='${data.id}'>Comment</button>
                </form>
            </div>
        </div>`
}

//this function displays only the relevant costs for the activity
//it will return either cost/adult, cost/child cost/group or cost of 0 ("free") displayed with two decimal points
function calculateCost(data){
    let adultCost = 0;
    let kidCost = 0;
    let groupCost = 0;
    let totalCost
    if(data.adult_cost && data.adult_cost > 0){adultCost = data.adult_cost;}
    if(data.kid_cost && data.kid_cost > 0 ){kidCost = data.kid_cost}
    if(data.group_cost && data.group_cost > 0){groupCost = data.group_cost}

    if (adultCost === 0 && kidCost === 0 && groupCost === 0){
        totalCost = 0;
    }else if (adultCost === 0 && kidCost === 0 && groupCost > 0){
        totalCost = `<div class='activity-cost'><p>Group Price: $${groupCost.toFixed([2])}/group of${data.group_size}</p></div>`
    }else if (groupCost === 0 && kidCost > 0 && adultCost > 0){
        adultCost = adultCost;
        kidCost = kidCost;
        totalCost = `<div class='activity-cost'>
                        <p>Adult price: $${adultCost.toFixed([2])}</p>
                        <p>Child price: $${kidCost.toFixed([2])}</p></div>`
    }else if(groupCost === 0 && kidCost === 0 && adultCost > 0){
        totalCost = `<div class='activity-cost'>
                        <p>Price: $${adultCost.toFixed([2])} per person </p>
                    </div>`
    }else{
        totalCost = `
            <div class='activity-cost'>
                <p>$${adultCost.toFixed([2])} /person</p>
                <p>$${groupCost.toFixed([2])} /group of  ${data.group_size}</p>
            </div>`
    }

    return totalCost;
}

//to join the activity
function handleRSVP(){
    $('.js-RSVP').click(function(e){
        let activityId = this.id;
        let activityName = this.name;
        $('html,body').scrollTop(0);
        openModal();
        const rsvp = respondActivity(activityId, activityName);
        $('.lined-paper').html(rsvp);
        handleSubmitResponse();    
    })
}

//form for adding a response; appears in modal
function respondActivity(id, name){
    return`        
        <section class='rsvp-page'>
            <form class='js-rsvp-form'>
                <h3 class='handwrite'>${name}</h3>
                <fieldset>
                    <legend>Are you bringing anyone?</legend>
                    <label for='kids-attending'>Kids (under 12)</label>
                    <input type='number' max='10' min='0'name='kids-attending' id='kids-attending'>
                    <label for='adults-attending'>Adults (aside from you)</label>
                    <input type='number' max='10' min='0' name='adults-attending' id='adults-attending'>
                </fieldset>
                <button type='submit' class='submit-rsvp sticker' id='${id}'>Join</button>
            </form>
        </section>`
}

function handleSubmitResponse(){
    $('.js-rsvp-form').submit(function(e){
        e.preventDefault();
        closeModal();
        //this is to keep all entries as numbers
        let kids = parseInt($(this).find('#kids-attending').val(), 10);
        if(kids){kids=kids}else kids=0;
        let adults = parseInt($(this).find('#adults-attending').val(), 10);
        if(adults){adults=adults}else adults=0; adults++;      
        let id = $(this).find('.submit-rsvp').attr('id');
        let data = {
            id: id,
            adult_number: adults,
            kid_number: kids,
            userId: CURRENT_SESSION.user_id
        }
        updateJoinActivity(data)
    })
}

function updateJoinActivity(data){
    $.ajax({
        type: 'PUT',
        url: `activity/join/${data.id}`,
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: refreshPage(data.id),
        dataType: 'json'})
    .then(closeModal)
}

//Eventually, I would like to add a "leave activity" option here that will do the opposite of joining


//this will refresh the activity page if the user joins on that page
//or the event page if the user joins from there
function refreshPage(id){
    if($('.js-activity-page').hasClass('hidden')){
        getEventInformation(CURRENT_SESSION.event_id);
    }else{retrieveActivityData(id)}
}


//the next section deals with user comments on the activity
function handleSubmitComment(){
    $('.comment-section').submit(function(e){
        e.preventDefault();
        let comment = $(this).find('.text-input').val();
        let id = $(this).find('.submit-comment').attr('name');
        let name = CURRENT_SESSION.username;
        let data = {
            comment: comment,
            id: id,
            name: name
        }
        updateComments(data);
    })
}

function updateComments(data){
    $.ajax({
        type: 'PUT',
        url: `activity/comments/${data.id}`,
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: retrieveActivityData(data.id),
        dataType: 'json'})
}

//the next section is for the user's profile page
//activites are displayed in two sections:
    //activites that they organized and activities that they are attending but didn't organize
function populateProfile(){
    let data = {
        userId: CURRENT_SESSION.user_id,
        eventId: CURRENT_SESSION.event_id
    }
    getHostedActvities(data)
    getUserActivities(data)
    handleUserActivity();
}

function getHostedActvities(data){
    let URL = `activity/host?userId=${data.userId}&eventId=${data.eventId}`
    $.ajax({
        type: 'GET',
        url: URL,
        contentType: 'application/json',
        success: publishHostedActivities,
        dataType: 'json'})
}

function getUserActivities(data){
    $.ajax({
        type: 'GET',
        url: `activity/user?userId=${data.userId}&eventId=${data.eventId}`,
        contentType: 'application/json',
        success: publishUserActivites,
        dataType: 'json'})
}

function publishHostedActivities(results){
    let hosted = renderHostedActivities(results)
    $('.user-host-activities').html(hosted)
}

function publishUserActivites(results){
    let going = renderUserActivities(results)
    $('.user-attend-activities').html(going)
}

function renderHostedActivities(results){
    if(!(results.length==0)){
        const activity = results.map((item, index) => generateHostedActivities(item))
    return`
        <div class='paper blue-border rotate-left activity-details'>
            <div class='thumb-yellow'></div>
            <h3 class='handwrite'>Activities you are hosting</h3>
            <div class='hosted-activities'>
            ${activity.join('')}
            </div>
        </div>`}else{return`<div></div>`}
}

function renderUserActivities(results){
    if(!(results.length==0)){
        const activity = results.map((item, index) => generateUserActivities(item))
    return`
        <div class='paper green-border rotate-right activity-details'>
            <div class='thumb-red'></div>
            <h3 class='handwrite'>Activites you are attending</h3>
            <div class='user-activities'>
                ${activity.join('')}
            </div>
        </div>`}else{return`<div></div>`}
}

function generateHostedActivities(results){
    let activity = []
    return`
    <div class='each-hosted' id='${results.id}'>
        <button type='button' class='activity-name host-activity-name'>${results.name}</button>
        <div class='activity-buttons'>
            <button type='button' class='delete-activity'>Delete</button>
            <button type='button' class='edit-activity'>Edit</button>
        </div>
    </div>`
}

function generateUserActivities(results){
    let activity = []
    return`
        <button type='button' class='activity-name user-activity-name' id='${results.id}'>${results.name}</button>`
}

//these handle all the buttons on the profile page
function handleUserActivity(){
    $('.js-profile-page').on('click', '.user-activity-name', function(e){
        let id = this.id;
        showActivityPage(id);
    });
    $('.js-profile-page').on('click', '.host-activity-name', function(e){
        let id = $(this).parents('.each-hosted').attr('id');
        showActivityPage(id);
    });
    $('.js-profile-page').on('click', '.delete-activity', function(e){
        let id = $(this).parents('.each-hosted').attr('id');
        confirmDelete(id);
    });
    $('.js-profile-page').on('click', '.edit-activity', function(e){
        let id = $(this).parents('.each-hosted').attr('id');
        //console.log(id);
        editActivityForm(id)
    });
};

//the delete button goes through the same confirmation process as deleting an event first
function DeleteActivity(id){
    $.ajax({
        type: 'DELETE',
        url: `/activity/${id}`,
        contentType: 'application/json',
        success: closeModal(),
        dataType: 'json'
    })
    .then(showProfilePage)
}

//the activity information is retrieved first and used to populate the placeholder values of the form
function editActivityForm(id){
    $.ajax({
        type: 'GET',
        url: `/activity/${id}`,
        contentType: 'application/json',
        success: displayEditActivity,
        dataType: 'json'
    })
}

function displayEditActivity(results){
    openModal();
    let form = renderEditActivity(results)
    $('.lined-paper').html(form)
    handleUpdateActivity();
    handleSubmitEditActivity();
}

function renderEditActivity(results){

    //this puts activity information into placeholders if it exists and leaves the inputs empty if it does not
    let name = '';
    let url = '';
    let date = '';
    let time = '';
    let kidCost = '';
    let adultCost = '';
    let groupCost = '';
    let groupSize = '';
    if(results.name){name=results.name}
    if(results.url){url=results.url}
    if(results.date){date=results.data}
    if(results.time){date=results.time}
    if(results.kid_cost){kidCost=results.kid_cost}
    if(results.adult_cost){adultCost=results.adult_cost}
    if(results.group_cost){groupCost=results.group_cost}
    if(results.group_size){groupSize=results.group_size}

    return`
            <form class='js-update-activity-form'>
                <fieldset class='basic-info'>
                    <legend>Provide Activity Information</legend>
                    <div class='input-line'>    
                        <label for='activity-name'>Activity name</label>
                        <input type='text' name='activity-name' id='activity-name' placeholder='${name}'>
                    </div>
                    <div class='input-line'>    
                        <label for='activity-url'>Website link (opt)</label>
                        <input type='text' name='activity-url' id='activity-url' placeholder='${url}'>
                    </div>
                    <div class='input-line'> 
                        <label for='activity-date'>Date</label>
                        <input type='date' name='activity-date' id='activity-date' class='date' placeholder=${date}>
                    </div>
                    <div class='input-line'> 
                        <label for='activity-time'>Time</label>
                        <input type='time' name='activity-time' id='activity-time' placeholder=${time}>
                    </div>
                    <div class='input-line'>    
                        <label for='kid-friendly'>Children under 12?</label>                  
                        <input type='checkbox' name='kid-friendly' id='kid-friendly'>                        
                    </div>
                </fieldset>
                <fieldset class='price-info hidden'>
                    <legend>How much will it cost?</legend>
                    <div class='input-line price-line'> 
                        <input type='number' step='0.01' name='adult-cost' id='adult-cost' placeholder='$${adultCost}'>
                        <label for='adult-cost'>per adult</label>
                    </div>
                    <div class='input-line price-line'> 
                        <input type='number' step='0.01' name='kid-cost' id='kid-cost' placeholder='$${kidCost}'>
                        <label for='kid-cost'>per child under 12</label>
                    </div>
                    <div class='input-line price-line'> 
                        <input type='number' step='0.01' name='group-cost' id='group-cost' placeholder='$${groupCost}'>
                        <label for='group-cost'>per group of</label>
                    </div>
                    <div class='input-line price-line'> 
                        <input type='number' name='group-size' id='group-size' placeholder='$${groupSize}'>
                        <label for='group-size'>people</label>
                    </div>
                </fieldset>
                <div class='form-buttons'>
                    <button type='button' class='show-basic-info sticker-green'>Basic</button>
                    <button type='button' class='show-price-info sticker-green'>Price?</button>
                    <button type='submit' class='submit-update-activity sticker' id='${results.id}'>Submit</button>
                </div>
            </form>`
}

function handleUpdateActivity(){
    $('.show-price-info').click(function(){
        $('.basic-info').addClass('hidden')
        $('.price-info').removeClass('hidden')
    })

    $('.show-basic-info').click(function(){
        $('.basic-info').removeClass('hidden')
        $('.price-info').addClass('hidden')
    })
}

//values are collected in basically the same way as creating the initial activity
//if a field is blank, it's left out of the data for updating
function handleSubmitEditActivity(){
        $('.js-update-activity-form').on('submit', function(e){
            e.preventDefault();
            const data = {
                id: $(this).find('.submit-update-activity').attr('id')
            }
            let kidCost = parseFloat($(this).find('#kid-cost').val(), 10);
            if(kidCost){data.kid_cost = kidCost}
            let adultCost = parseFloat($(this).find('#adult-cost').val(), 10);
            if(adultCost){data.adult_cost = adultCost}
            let groupCost = parseFloat($(this).find('#group-cost').val(), 10);
            if(groupCost){data.group_cost = groupCost}
            let groupSize = parseInt($(this).find('#group-size').val(), 10);
            if(groupSize){data.group_size=groupSize}
            let name = $(this).find('#activity-name').val();
            if(name){data.activity_name = name}
            let url = $(this).find('#activity-url').val();
            if(url){data.activity_url = url}
            let date = $(this).find('#activity-date').val();
            if(date){data.activity_date = date}
            let time = $(this).find('#activity-time').val()
            if(time){data.activity_time = time}

            putEditActivity(data);
            closeModal();
        });
}

function putEditActivity(data){
    $.ajax({
        type: 'PUT',
        url: `/activity/${data.id}`,
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: closeModal,
        dataType: 'json'
    }).then(showProfilePage)
}

//the next section handles login and signup for users that have been invited to joing an activity
function handleInviteLink(){
    let eventId = getQueryVariable('eventId')
    let event = getQueryVariable('name')

    //this makes the welcome page display slightly differently, with the event name
    CURRENT_SESSION.event_id = eventId;
    if(!event==false){
        let eventName = event.split('+').join(' ')
        $('.welcome-message').html(`You have been invited to join <p class='invite-name'>${eventName}</p>`)
        $('.js-not-invite').remove();
        $('.intro-content').addClass('intro-content-invite')}
}

function getQueryVariable(variable){
    let query = window.location.search.substring(1);
    const querypart = query.split('&');
    for(let i=0; i<querypart.length; i++){;
        let querypair = querypart[i].split('=');
        if (querypair[0] == variable){return querypair[1]}
    }
    return (false);
}

//basic event handlers
function escKeyHandler(){
    $(document).on('keyup', function(event){
      if (event.keyCode == 27){
        closeModal();
      }
    });
  }

function openModal(){
    $('.contain-modal').removeClass('behind')
}

function closeModal(){
    $('.contain-modal').addClass('behind')
    $('.lined-paper').html(`<div></div>`)
}

function handleCloseModal(){
    $('.overlay').click(e => closeModal());
}

function handleNavBar(){
    if(!mqLarge.matches){
        $('.js-nav-bar').click(function(e){ 
            $('.js-nav-bar').addClass('hidden');
            $('.menu').removeClass('hidden');
            $('.close-menu').addClass('hidden');
        })}
}

handleNavBar();
handleMenuButton();
handleMenuClose();
escKeyHandler();
handleMockUsers();
handleInviteLink();
handleStartButtons();
handleNavButtons();
handleActivity();
handleCloseModal();
