const CURRENT_SESSION = {
    username: "",
    user_id: "",
    user_events: [],
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
    $('.login-page').removeClass("hidden");
    const login = renderLoginForm();
    $('.login-page').html(login);
    handleLoginButton();
}

function displayCreateAccount(){
    $('.landing-page').addClass("hidden");
    $('.login-page').removeClass("hidden");
    const createUser = renderCreateAccount();
    $('.login-page').html(createUser);
    handleNewAccount();
}

//form for loggin ing
function renderLoginForm(){
    return`
    <div class="content">
        <div class="paper yellow-border">
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
        </div>
    </div>`
}

//form for creating a new account
function renderCreateAccount(){
    return`
    <div class="content">
        <div class="paper yellow-border">
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
        </div>
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
    $('.nav-welcome').click(e => getUserEvents());
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
        CURRENT_SESSION.user_events = [];
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
        <h3 class="title">WELCOME</h3>
        <div class="paper blue-border">
            <div class="thumb-yellow"></div>
            <div class="button-section">

                <p class="handwrite">My events</p>
                <div class="event-buttons">
                    ${button}
                </div>
                <button type="button" class="make-new-event red-sticker">New Event</button>
            </div>
        </div>`
}

/* <div class="task-buttons">
    <button type="button" class="invite-friends circle-sticker">Invite Friends</button>
    <button type="button" class="make-new-event red-sticker">New Event</button>
</div>*/

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
    }
    showWelcomePage();
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
    console.log(CURRENT_SESSION.user_events.length);
    if(!(CURRENT_SESSION.user_events.length === 0)){
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
    $('.lined-paper').html(event);
    handleSubmitNewEvent();
}

function renderNewEventForm(){
    return`
    <form class="new-event-form">
        <fieldset>
            <legend class="handwrite">Create Your Event</legend>
            <label for="event-name">Name</label>
            <input type="text" name="event-name" id="event-name">
            <label for="event-location">Location</label>
            <input type="text" name="event-location" id="event-location">
            <label for="event-start-date">Start date</label>
            <input type="date" name="event-start-date" id="event-start-date">
            <label for="event-end-date">End date</label>
            <input type="date" name="event-end-date" id="event-end-date">
        </fieldset>
        <button type="submit" class="submit-new-event sticker">Submit</button> 
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
}

//displays main event as a banner
/*function renderEvent(name, location, dates){
    return `
        <div class="event-info-section">
            <div class="thumb-red"></div>
            <div class="include-edit">
                <h1 class="event-name handwrite">${name}</h1>
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
}*/

function renderEvent(name, location, dates){
    return`
        <div class="include-edit">
            <h2 class="event-name title">${name}</h2>
            <button type="button" class="edit edit-event-name not-organizer">edit</button>
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
        <form class="js-edit-event-name js-edit">
            <label for="edit-event-name">Enter new event name</label>
            <input type="text" name="edit-event-name" id="edit-event-name">
            <button type="submit" class="sticker">Submit</button>
        </form>   
    `
}

function editEventLocation(){
    return `
    <form class="js-edit-event-location js-edit">
        <label for="edit-event-location">Enter new event location</label>
        <input type="text" name="edit-event-location" id="edit-event-location">
        <button type="submit" class="sticker">Submit</button>
    </form>   
`
}

function editEventDates(){
    return `
        <form class="js-edit-event-dates js-edit">
            <label for="edit-event-dates">Enter new start date</label>
            <input type="date" name="edit-event-start" id="edit-event-start">
            <label for="edit-event-dates">Enter new end date</label>
            <input type="date" name="edit-event-end" id="edit-event-end">
            <button type="submit" class="sticker">Submit</button>
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
    handleRSVP();
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

    let thumbColorArray = ["thumb-yellow", "thumb-green", "thumb-red"]
    let borderColorArray = ["blue-border","light-blue-border", "yellow-border", "green-border", "orange-border"]
    let rotateArray = ["rotate-right", "rotate-left"]
    let thumbColor = thumbColorArray[Math.floor(Math.random()*thumbColorArray.length)]
    let borderColor = borderColorArray[Math.floor(Math.random()*borderColorArray.length)]
    let rotate = rotateArray[Math.floor(Math.random()*rotateArray.length)]
    console.log(thumbColor);
    console.log(borderColor);

    return `        
        <div class="activity wrapper ${borderColor} ${rotate}">
            <div class="${thumbColor}"></div>
            <button type="button" class="activity-name handwrite" id="${results.id}">${results.name}</button>
            <div class="attending">
                <p class="fun-text">${number} people are going</p>
            </div>
            <div class="js-kids-allowed"></div>
            <div>
                <p class="activity-cost">Cost: <span="fun-text">${price}</span></p>
            </div>
            <button type="button" name="${results.name}" class="js-RSVP sticker-green-circle" id="${results.id}">Join!</button>
         </div>`;
}

function handleNewActivity(){
    $('.js-make-activity').click(e =>{
        console.log('handle new activity ran');
        openModal();
        const activity = createActivity();
        $('.lined-paper').html(activity);
        handleSubmitNewActivity();
    })
}

function handleRSVP(){
    console.log('handleRSVP ran')
    $('.js-RSVP').click(function(e){
    console.log('handleRSVP clicked');
    showActivityPage();
    $('body, html').animate({scrollTop:0}, 0);
    let activityId = this.id;
    let activityName = this.name;
    console.log(activityName)
    openModal();
    const rsvp = respondActivity(activityId, activityName);
    $('.lined-paper').html(rsvp);
    handleSubmitResponse();    
})
}

function handleActivity(){
    $('.js-event-page').on('click', '.activity-name', function(e){
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
                        <label for="activity-date">Date (optional)</label>
                        <input type="date" name="activity-date" id="activity-date" class="date">
                    </div>
                    <div class="input-line"> 
                        <label for="activity-time">Time (optional)</label>
                        <input type="time" name="activity-time" id="activity-time">
                    </div>
                    <div class="input-line">    
                        <label for="kid-friendly">Children under 12?</label>                  
                        <input type="checkbox" name="kid-friendly" id="kid-friendly">                        
                    </div>
                </fieldset>
                <fieldset>
                    <legend>How much will it cost?</legend>
                    <div class="input-line price-line"> 
                        <input type="number" step="0.01" name="adult-cost" id="adult-cost" placeholder="e.g. 5.00">
                        <label for="adult-cost">per adult</label>
                    </div>
                    <div class="input-line price-line"> 
                        <input type="number" step="0.01" name="kid-cost" id="kid-cost" placeholder="e.g. 3.00">
                        <label for="kid-cost">per child under 12</label>
                    </div>
                    <div class="input-line price-line"> 
                        <input type="number" step="0.01" name="group-cost" id="group-cost" placeholder="e.g. 80.00">
                        <label for="group-cost">per group of</label>
                    </div>
                    <div class="input-line price-line"> 
                        <input type="number" name="group-size" id="group-size" placeholder="e.g. 10">
                        <label for="group-size">people</label>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>Who else are you bringing?</legend>
                    <div class="input-line">
                        <label for="kids-attending">Kids (under 12)</label>
                        <input type="number" max="10" min="1" name="kids-attending" id="kids-attending">
                    </div>
                    <div class="input-line">
                        <label for="adults-attending">Adults</label>
                        <input type="number" max="10" min="1" name="adults-attending" id="adults-attending">
                    </div>
                </fieldset>     
                <button type="submit" class="submit-new-activity sticker">Submit</button>
            </form>`
}

function handleSubmitNewActivity(){
    $('.js-activity-form').on('submit', function(e){
        e.preventDefault();
        let kids = parseInt($(this).find('#kids-attending').val(), 10);
        let adults = parseInt($(this).find('#adults-attending').val(), 10);
        let kidCost = parseFloat($(this).find('#kid-cost').val(), 10);
        let adultCost = parseFloat($(this).find('#adult-cost').val(), 10);
        let groupCost = parseFloat($(this).find('#group-cost').val(), 10);
        adults = adults+1;
        let data = {
            eventId: CURRENT_SESSION.event_id,
            activity_name: $(this).find('#activity-name').val(),
            activity_date: $(this).find('#activity-date').val(),
            activity_time: $(this).find('#activity-time').val(),
            kid_cost: kidCost,
            adult_cost: adultCost,
            group_cost: groupCost,
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
function respondActivity(id, name){
    return`        
        <section class="rsvp-page">
            <form class="js-rsvp-form">
                <h2 class="handwrite">${name}</h2>
                <fieldset>
                    <legend>Who's coming?</legend>
                    <label for="kids-attending">Kids (under 12)</label>
                    <input type="number" max="10" min="0"name="kids-attending" id="kids-attending">
                    <label for="adults-attending">Adults (aside from you)</label>
                    <input type="number" max="10" min="0" name="adults-attending" id="adults-attending">
                </fieldset>
                <button type="submit" class="submit-rsvp sticker" id="id">Submit</button>
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
