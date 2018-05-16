const CURRENT_SESSION = {
    username: "",
    user_id: "",
    user_events: "",
    event: "",
    event_id: "",
    organizer_id: ""
};



//Initial set up, allowing user to choose to log in or create a new account
function handleStartButtons(){
    $('.js-log-in').click(e => displayLogin());
    $('.js-make-account').click(e => displayCreateAccount());
}

function displayLogin(){
    $('.landing-page').addClass("hidden");
    const login = renderLoginForm();
    $('.login-page').html(login);
    handleLoginButton();
}

function displayCreateAccount(){
    $('.landing-page').addClass("hidden");
    const createUser = renderCreateAccount();
    $('.login-page').html(createUser);
    handleNewAccount();
}

//form for loggin ing
function renderLoginForm(){
    return`
    <div class="paper">
        <div class="thumb-green"></div>
        <form class="js-login">
            <fieldset>
                <legend>Log In</legend>
                <div class="input-line"> 
                    <label for="login-username">Username</label>
                    <input type="text" name="login-username" id="login-username" class="login-username">
                </div>
                <div class="input-line"> 
                    <label for="user-password">Password</label>
                    <input type="text" name="user-password" id="user-password">
                </div>
            </fieldset>
            <button type="submit sticker" class="js-login-button sticker">Submit</button>
        </form>
    </div>`
}

//form for creating a new account
function renderCreateAccount(){
    return`
    <div class="paper">
        <div class="thumb-green"></div>
        <form class="js-create-account">
            <fieldset>
                <legend>Create New Account</legend>
                <div class="input-line"> 
                    <label for="create-user-name">Choose a public user name</label>
                    <input type="text" name="create-user-name" id="create-user-name">
                </div>
                <div class="input-line"> 
                    <label for="login-email">Email</label>
                    <input type="text" name="login-email" id="login-email" class="user-email">
                </div>
                <div class="input-line"> 
                    <label for="user-password">Password</label>
                    <input type="text" name="user-password" id="user-password">
                </div>
            </fieldset>
            <button type="submit" class="js-create-account-button sticker">Submit</button>
        </form>
    </div>`
}

//The next section handles user login and selecting the event
function handleLoginButton(){
    $('.js-login').submit(function(e){
        e.preventDefault();
        let username = $(this).find('#login-username').val();
        let password = $(this).find('#user-password').val();
        CURRENT_SESSION.username = username;
        handleLogin(username, password);
        $(this).find('#login-username').val("");
        $(this).find('#user-password').val("");
    });
};

function handleLogin(username, password){
    const data = {username: username,
                password: password}
    console.log(data);
    $.ajax({
        type: "POST",
        url: "/auth/login",
        data: JSON.stringify(data),
        contentType: "application/json",
        success: getUserData,
        dataType: "json"
    })
}

//user data is retrieved and then used to retrieve the events that they are registered for
function getUserData(token){
    console.log('get user data ran');
    let authToken = token.authToken;
    console.log(authToken);
    $.ajax({
        beforeSend: function(xhr){
            xhr.setRequestHeader(`Authorization`, `Bearer ${authToken}`)
        },
        type: "GET",
        url: `/user/userdata/${CURRENT_SESSION.username}`,
        contentType: "application/json",
        success: updateSessionInformation,
        dataType: "json"
    })
    .then(getUserEvents)
}

function updateSessionInformation(data){
    console.log(data);
    CURRENT_SESSION.username = data.username;
    CURRENT_SESSION.user_id = data.id;
    console.log(CURRENT_SESSION.username);
}

//these next function handle creating a new user account
function handleNewAccount(){
    $('.js-create-account').submit(function(e){
        e.preventDefault();
        console.log('create Account clicked');
        const data = {
            username: $(this).find('#create-user-name').val(),
            email: $(this).find('#login-email').val(),
            password: $(this).find('#user-password').val(),
        }
        createAccount(data);
    })
}

function createAccount(data){
    console.log('create account ran');
    console.log('data');
    $.ajax({
        type: "POST",
        url: "/user",
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: updateSessionInformation,
        dataType: "json"
    })
    .then(showWelcomePage)
}

//the nav bar is displayed for the first time on the welcome page
function handleNavButtons(){
    $('.nav-welcome').click(e => showWelcomePage());
    $('.nav-event').click(e => handleNavEvent());
    $('.nav-logout').click(e => Logout());
    //handleInvite();
    //handleProfile();
    //handleLogout();    
}

function handleNavEvent(){
    let event = CURRENT_SESSION.event;
    console.log(event);
    getEventInformation(event);
}

function Logout(){
        CURRENT_SESSION.username = "";
        CURRENT_SESSION.user_id = "";
        CURRENT_SESSION.user_events = "";
        CURRENT_SESSION.event = "";
        CURRENT_SESSION.event_id = "";
        CURRENT_SESSION.organizer_id = "";

    $('.js-nav-bar').addClass("hidden")
    $('.js-landing-page').removeClass("hidden")
    $('.js-login-page').addClass("hidden")
    $('.js-welcome-page').addClass("hidden")
    $('.js-event-page').addClass("hidden")
    $('.js-activity-page').addClass("hidden")
}

//once user logs on, they can choose an event or make a new one
function showWelcomePage(data){
    console.log('show welcome page');

    $('.js-landing-page').addClass("hidden");
    $('.js-welcome-page').removeClass("hidden");
    $('.js-event-page').addClass("hidden");
    $('.js-nav-bar').removeClass("hidden");

    const welcome = renderWelcome();
    $('.welcome-page').html(welcome);

    handleEventButton();
    handleNewEventButton();
}   

function renderWelcome(){
    let button = generateEventButtons()
    console.log(button);
    return`
        <div class="paper">
            <div class="thumb-red"></div>
            <div class="info-section">
                <h2>Welcome ${CURRENT_SESSION.username}!</h2>
                <p class="emphasis">What would you like to do today?</p>
            </div>
            <div class="button-section">
                <div class="task-buttons">
                    <button type="button" class="invite-friends circle-sticker">Invite Friends</button>
                    <button type="button" class="make-new-event red-sticker">New Event</button>
                </div>
                <p class="emphasis">Or choose one of your events</p>
                <div class="event-buttons">
                ${button}
            </div>
            </div>
        </div>`
}

//the next section makes a call to get events for a registered user, adds them to the
//CURRENT_SESSION object and generates a button for each event which are displayed on the Welcome page
function getUserEvents(){
    console.log('get user events ran');
    $.ajax({
        type: "GET",
        url: `/event/byUserId/${CURRENT_SESSION.user_id}`,
        contentType: 'application/json',
        dataType: "json",
        success: updateUserEvents
    })
}

function updateUserEvents(data){
    console.log('update user events')
    console.log(data);
    if (!(data === undefined || data.length === 0)){
        const events = data.map((item, index) => renderUserEvents(item))
    CURRENT_SESSION.user_events = events;
    console.log(CURRENT_SESSION.user_events);
    showWelcomePage();
    }
}

function renderUserEvents(event){
    console.log('render user events')

    const data = {name: event.name,
                  id: event.id}
    //console.log(data)
    return data;
}

function generateEventButtons(){
    console.log('generate event buttons ran')
    let button = []
    console.log(CURRENT_SESSION.user_events);
    if(!(CURRENT_SESSION.user_events[0].name === undefined)){
        for(let i=0; i<CURRENT_SESSION.user_events.length; i++){
            //console.log(i);
            //console.log(`console.log(Event: ${CURRENT_SESSION.user_events[i].name}`);
            button.push(`<button type="button" class="event-button generate-sticker" id="${CURRENT_SESSION.user_events[i].name}">${CURRENT_SESSION.user_events[i].name}</button>`)
        }}
    console.log(button)
    return button;
}

//this sections handles making a new event, including displaying a form, retrieving information,
//posting a new event and displaying the event page
function handleNewEventButton(){
    $('.make-new-event').click(e => newEventForm())
}

function newEventForm(){
    console.log('new event form ran');
    openModal();
    const event = renderNewEventForm();
    $('.modal').html(event);
    handleSubmitNewEvent();
}

function renderNewEventForm(){
    return`
    <form class="new-event-form">
        <h2>Create a new Event</h2>
        <fieldset>
            <legend>Give event detail</legend>
            <label for="event-name">Name</label>
            <input type="text" name="event-name" id="event-name">
            <label for="event-location">Location</label>
            <input type="text" name="event-location" id="event-location">
            <label for="event-start-date">Start date</label>
            <input type="date" name="event-start-date" id="event-start-date">
            <label for="event-end-date">End date</label>
            <input type="date" name="event-end-date" id="event-end-date">
        </fieldset>
        <button type="submit" class="submit-new-event">Submit</button> 
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
        console.log(event);
        postNewEvent(event);
    })
}

function postNewEvent(data){
    console.log('post new event ran');
    $.ajax({
        type: "POST",
        url: "/event",
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: showEventPage,
        dataType: "json"
    })
}

function handleEventButton(){
    $('.event-button').click(function(e){
        let name = this.id;
        console.log(name)
        getEventInformation(name)
    }) 
}

function getEventInformation(event){
    console.log('get event information');
    $.ajax({
        type: "GET",
        url: `/event/${event}`,
        contentType: 'application/json',
        success: showEventPage,
        dataType: "json"
    })
}

function showEventPage(data){
    //console.log('show event page ran');
    closeModal();
    $('.js-welcome-page').addClass("hidden");
    $('.js-activity-page').addClass("hidden");
    $('.js-event-page').removeClass("hidden");

    CURRENT_SESSION.event = data.name;
    CURRENT_SESSION.event_id = data.id;
    CURRENT_SESSION.organizer_id = data.organizer;

    let name = data.name;
    let location = data.location;
    let dates = data.dates;
    let id = data.id;


    const event = renderEvent(name, location, dates)
    retrieveActivities(id);
    //console.log(activity);
    $('.event-information').html(event);
    handleEditEventButtons();
    handleDeleteEvent();
    handleViewProfile()
    handleNewActivity();
    handleRSVP();
}

//displays main event as a banner
function renderEvent(name, location, dates){
    return `
        <div class="event-info-section">
            <div class="thumb-red"></div>
            <div class="include-edit">
                <h1 class="event-name">${name}</h1>
                <button type="button" class="edit edit-event-name not-organizer">edit</button>
            </div>
            <div class="include-edit">
                <p>Where? <span class="fun-text">${location}!</span></p>
                <button type="button" class="edit edit-event-location not-organizer">edit</button>
            </div>
            <div class="include-edit">
                <p>When? <span class="fun-text">${dates}</span></p>
                <button type="button" class="edit edit-event-dates not-organizer">edit</button>
            </div>
            <p class="emphasis">Join a fun activity below or create your own!</p>
        </div>
        <div class="event-button-section">
            <button type="button" class="js-delete-event not-organizer sticker">Delete</button> 
            <button type="button" class="js-make-activity circle-sticker">New Activity</button>   
        </div>`    
}

//buttons for editing event: only the host of event can edit
function handleEditEventButtons(){
    $('.edit-event-name').click(function(e){
        const name = editEventName();
        $('.modal').html(name);
        openModal();
        handleEditNameButton();
    })
    $('.edit-event-location').click(function(){
        const location = editEventLocation();
        $('.modal').html(location);
        openModal();
        handleEditLocationButton();
    })
    $('.edit-event-dates').click(function(){
        const dates = editEventDates();
        $('.modal').html(dates);
        openModal();
        handleEditDatesButton();
    })
}

//forms for editing individual aspects of the events
function editEventName(){
    return `
        <form class="js-edit-event-name">
            <label for="edit-event-name">Enter new event name</label>
            <input type="text" name="edit-event-name" id="edit-event-name">
            <button type="submit">Submit</button>
        </form>   
    `
}

function editEventLocation(){
    return `
    <form class="js-edit-event-location">
        <label for="edit-event-location">Enter new event location</label>
        <input type="text" name="edit-event-location" id="edit-event-location">
        <button type="submit">Submit</button>
    </form>   
`
}

function editEventDates(){
    return `
        <form class="js-edit-event-dates">
            <label for="edit-event-dates">Enter new start date</label>
            <input type="date" name="edit-event-start" id="edit-event-start">
            <label for="edit-event-dates">Enter new end date</label>
            <input type="date" name="edit-event-end" id="edit-event-end">
            <button type="submit">Submit</button>
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
    console.log(data);
    $.ajax({
        type: "PUT",
        url: `/event/${CURRENT_SESSION.event_id}`,
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: getEventInformation,
        dataType: "json"
    })
    
}

//delete event
function handleDeleteEvent(){
    $('.js-delete-event').click(e => DeleteEvent())
}

function DeleteEvent(){
    $.ajax({
        type: "DELETE",
        url: `/event/${CURRENT_SESSION.event_id}`,
        contentType: 'application/json',
        success: showWelcomePage,
        dataType: "json"
    })
}

function handleViewProfile(){
    $('.js-user-profile').click(function(e){
        console.log('view profile button clicked')

    })
}

function showUserPage(){

}

function renderUserPage(){
    
}

//displays activites that have been created under the event
function retrieveActivities(eventId){
    console.log('retrieve activities')
    console.log(eventId)

    $.ajax({
        type: "GET",
        url: `/activity/event/${eventId}`,
        contentType: 'application/json',
        dataType: "json",
        success: displayActivities
    })
}

function displayActivities(data){
    console.log('display activities');
    console.log(data);
    const activity = data.map((item, index) =>renderActivities(item))
    $('.all-activities').html(activity);
}

function renderActivities(results){
    console.log(results.activity_name)
    let price;
    //if ((results.adult_cost || results.kid_cost) && (results.adult_cost > 0 || results.kid_cost > 0))
    if(!results.adult_cost || results.adult_cost === 0){
        price = "free"
    }
    else{
        price = `$${results.activity_cost}`
    }
    console.log(price);
    
    let kidNumber = 0;
    let adultNumber = results.adult_number;
    let number = kidNumber + adultNumber;

    if(results.kid_number){
        kidNumber = results.kid_number
    }

    console.log(kidNumber)
    console.log(adultNumber)
    console.log()
    return `        
        <div class="activity wrapper">
            <div class="thumb-yellow"></div>
            <h2 class="activity-name">${results.name}</h2>
            <div class="attending">
                <p class="fun-text">${number} people are going</p>
            </div>
            <div class="js-kids-allowed"></div>
            <div>
                <p class="activity-cost">Cost: <span="fun-text">${price}</span></p>
            </div>
            <button type="button" class="js-RSVP sticker-green-circle">Join!</button>
         </div>`;
}

function handleNewActivity(){
    $('.js-make-activity').click(e =>{
        console.log('handle new activity ran');
        openModal();
        const activity = createActivity();
        $('.modal').html(activity);
        handleSubmitNewActivity();
    })
}

function handleRSVP(){
    $('.js-RSVP').click(e =>{
    console.log('handleRSVP ran');
    openModal();
    const rsvp = respondActivity();
    $('.modal').html(rsvp);
    handleSubmitResponse();    
})
}

function handleActivity(){
    $('.js-event-page').on('click', '.activity', e =>{
        showActivityPage();
    });
};

//form for creating a new activity; appears in modal
function createActivity(){
    return`
            <form class="js-activity-form">
                <fieldset>
                    <legend>Provide Activity Information</legend>
                    <div class="input-line">    
                        <label for="activity-name">Activity name</label>
                        <input type="text" name="activity-name" id="activity-name">
                    </div>
                    <div class="input-line"> 
                        <label>Additional information</label>
                    </div>
                        <textarea class="text-input comments"></textarea>
                    <div class="input-line"> 
                        <label for="activity-date">Date</label>
                        <input type="date" name="activity-date" id="activity-date" class="date">
                    </div>
                    <div class="input-line"> 
                        <label for="activity-time">Time</label>
                        <input type="time" name="activity-time" id="activity-time">
                    </div>
                    <div class="input-line">                      
                        <input type="checkbox" name="kid-friendly" id="kid-friendly">
                        <label for="kid-friendly">Children under 12?</label>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>How much will it cost?</legend>
                    <div class="input-line price-line"> 
                        <input type="number" step="0.01" name="adult-cost" id="adult-cost" placeholder="5.00">
                        <label for="adult-cost">per adult</label>
                    </div>
                    <div class="input-line price-line"> 
                        <input type="number" step="0.01" name="kid-cost" id="kid-cost" placeholder="3.00">
                        <label for="kid-cost">per child under 12</label>
                    </div>
                    <div class="input-line price-line"> 
                        <input type="number" step="0.01" name="group-cost" id="group-cost" placeholder="80.00">
                        <label for="group-cost">per group of</label>
                    </div>
                    <div class="input-line price-line"> 
                        <input type="number" step="1" name="group-size" id="group-size" placeholder="10">
                        <label for="group-size">people</label>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>Who else are you bringing?</legend>
                    <div class="input-line">
                        <label for="kids-attending">Kids (under 12)</label>
                        <input type="number" max="10" name="kids-attending" id="kids-attending">
                    </div>
                    <div class="input-line">
                        <label for="adults-attending">Adults</label>
                        <input type="number" max="10" name="adults-attending" id="adults-attending">
                    </div>    
                <button type="submit" class="submit-new-activity">Submit</button>
            </form>`
}

function handleSubmitNewActivity(){
    $('.js-activity-form').on('submit', function(e){
        e.preventDefault();
        let kids = $(this).find('#kids-attending') || 0;
        let adults = 1 + $(this).find('#adults-attending').val()
        let data = {
            eventId: CURRENT_SESSION.event_id,
            activity_name: $(this).find('#activity-name').val(),
            activity_date: $(this).find('#activity-date').val(),
            activity_time: $(this).find('#activity-time').val(),
            kid_cost: $(this).find('#kid-cost').val(),
            adult_cost: $(this).find('#adult-cost').val(),
            group_cost: $(this).find('#group-cost').val(),
            group_size: $(this).find('#group-size').val(),
            activity_host: CURRENT_SESSION.user_id,
            attendees: CURRENT_SESSION.user_id,
            kid_number: kids,
            adult_number: adults,
            activity_comments: $(this).find('.comments').val()
        }
        console.log('handle submit activity ran');
        console.log(data);
        console.log(CURRENT_SESSION.user_id);
        postNewActivity(data);
        //showActivityPage();
        closeModal();
    });
};

function postNewActivity(data){
    $.ajax({
        type: "POST",
        url: "/activity",
        data: JSON.stringify(data),
        contentType: "application/json",
        success: showActivityPage,
        dataType: "json"
    })
}

function showActivityPage(){
    $('.js-event-page').addClass("hidden");
    $('.js-activity-page').removeClass("hidden");
    const activity = renderActivityPage();
    //console.log(activity);
    $('.activity-page').html(activity);
    returnToEvent();
    handleRSVP();
}

function renderActivityPage(){
    return`            
        <div class="activity-details paper">
                <button type="button" class="back-to-event">Return to event</button>
                <h2>${activitySTORE[0].activity_name}</h2>
                <p>Optional date and time</p>
                <p>Host: <span class="fun-text">${activitySTORE[0].host_name}</span></p>
                <p>Email host, maybe</p>
                <p>${activitySTORE[0].activity_description}</p>
                <p class="activity-cost">Cost: <span="fun-text">$500</span></p>
                <p class="fun-text">${activitySTORE[0].adults_attending} adults   ${activitySTORE[0].children_attending} kids</p>
                <button type="button" class="js-RSVP">RSVP</button>
        </div>
        <div class="activity-discussion wrapper">
            <p class="group-message">${activitySTORE[0].activity_notes}</p>
            <textarea class="text-input"></textarea>
            <button type="button">Post</button>
        </div>`
}

//form for adding a response; appears in modal
function respondActivity(){
    return`        
        <section class="rsvp-page">
            <form class="js-rsvp-form">
                <h2>${activitySTORE[0].activity_name}</h2>
                <fieldset>
                    <legend>Who's coming?</legend>
                    <label for="kids-attending">Kids (under 12)</label>
                    <input type="number" max="10" name="kids-attending" id="kids-attending">
                    <label for="adults-attending"></label>
                    <input type="number" max="10" name="adults-attending" id="adults-attending">
                </fieldset>
                <h3>Add additional comments</h3>
                <textarea class="text-input"></textarea>
                <button type="submit" class="submit-rsvp">Submit</button>
            </form>
        </section>`
}

function handleSubmitResponse(){
    $('.js-rsvp-form').submit(e =>{
        e.preventDefault();
        showActivityPage();
        closeModal();
        console.log('handle submit rsvp ran');
    })
}

function openModal(){
    $('.contain-modal').removeClass("behind")
}

function closeModal(){
    $('.contain-modal').addClass("behind")
}

function handleCloseModal(){
    $('.overlay').click(e => closeModal());
}

handleStartButtons();
handleNavButtons();
handleActivity();
handleCloseModal();
