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

function handleMockUsers(){
    $('.js-aunt-judy').click(function(e){
        let username = "Aunt Judy";
        let password = "judysfunvacation";
        CURRENT_SESSION.username = username;
        handleLogin(username, password);
    })

    $('.js-cousin-bob').click(function(e){
        let username = "Cousin Bob";
        let password = "bobsfunvacation";
        CURRENT_SESSION.username = username;
        handleLogin(username, password);
    })

    $('.js-grandma-jo').click(function(e){
        let username = "Grandma Jo";
        let password = "josfunvacation";
        CURRENT_SESSION.username = username;
        handleLogin(username, password);
    })

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
                        <input type="text" name="login-username" id="login-username" class="login-username" required>
                    </div>
                    <div class="input-line"> 
                        <label for="user-password">Password</label>
                        <input type="text" name="user-password" id="user-password" required>
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
                        <input type="text" name="create-user-name" id="create-user-name" required>
                    </div>
                    <div class="input-line"> 
                        <label for="login-email">Email</label>
                        <input type="text" name="login-email" id="login-email" class="user-email" required>
                    </div>
                    <div class="input-line"> 
                        <label for="user-password">Password</label>
                        <input type="text" name="user-password" id="user-password" required>
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
    //console.log(data);
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
    //console.log('get user data ran');
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
    .then(pushNewUser)
    .then(getUserEvents)
}

function updateSessionInformation(data){
    //console.log(data);
    CURRENT_SESSION.username = data.username;
    CURRENT_SESSION.user_id = data.id;
    //console.log(CURRENT_SESSION.username);
}

function pushNewUser(){
    let eventId = CURRENT_SESSION.event_id
    const data = {
        id: eventId,
        userId: CURRENT_SESSION.user_id
    }
    //console.log(data)
    if (!eventId == ""){
    $.ajax({
        type: "PUT",
        url: `/event/adduser/${eventId}`,
        data: JSON.stringify(data),
        contentType: "application/json",
        dataType: "json"
    })}
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
    //console.log('create account ran');
    //console.log('data');
    $.ajax({
        type: "POST",
        url: "/user",
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: updateSessionInformation,
        dataType: "json"
    })
    .then(pushNewUser)
    .then(getUserEvents)
}

//the nav bar is displayed for the first time on the welcome page
function handleNavButtons(){
    $('.nav-welcome').click(e => getUserEvents());
    $('.nav-event').click(e => handleNavEvent());
    $('.nav-logout').click(e => location.reload());
    $('.nav-invite').click(e => handleInvite());
    $('.nav-profile').click(e => alert('Coming soon!'))
    //handleProfile();  
}

function handleNavEvent(){
    if(CURRENT_SESSION.event_id === false){
        alert('You must create or select an event first!')
    }else{
    let event = CURRENT_SESSION.event;
    //console.log(event);
    getEventInformation(event);}
}

function Logout(){
    //let URL = `${window.location.protocol}//${window.location.host}`;
    //Window.location.href=URL;
    //location.reload();
    window.location = window.location.href.split("?")[0];
}

function handleInvite(){
    //console.log(CURRENT_SESSION.event_id);
    if(CURRENT_SESSION.event_id === false){
        alert('You must create or select an event first!')
    }else{
    openModal()
    let link = renderInvite()
    $('.lined-paper').html(link)
    handleCloseInvite()}
}

function renderInvite(){
    let inviteURL = getInviteURL()
    return`
        <h3 class="handwrite handwrite-small">Copy this link to invite friends and family!</h3>
        <div class="link-box"><p>${inviteURL}</p></div>
        <button type="button" class="sticker-green js-close-invite">Got it!</button>`
}

function getInviteURL(){
    let eventName=CURRENT_SESSION.event.split(" ").join("+");
    let query=`eventId=${CURRENT_SESSION.event_id}&name=${eventName}`
    let inviteURL = `${window.location.protocol}//${window.location.host}?${query}`
    return inviteURL
}

function handleCloseInvite(){
    $('.js-close-invite').click(e => closeModal())
}

//once user logs on, they can choose an event or make a new one
function showWelcomePage(data){
    //console.log('show welcome page');

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
    //console.log(button);
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
    //console.log('get user events ran');
    $.ajax({
        type: "GET",
        url: `/event/byUserId/${CURRENT_SESSION.user_id}`,
        contentType: 'application/json',
        dataType: "json",
        success: updateUserEvents
    })
}

function updateUserEvents(data){
    //console.log('update user events')
    //console.log(data);
    if (!(data === undefined || data.length === 0)){
        const events = data.map((item, index) => renderUserEvents(item))
    CURRENT_SESSION.user_events = events;
    //console.log(CURRENT_SESSION.user_events);
    }
    showWelcomePage();
}

function renderUserEvents(event){
    //console.log('render user events')

    const data = {name: event.name,
                  id: event.id}
    //console.log(data)
    return data;
}

function generateEventButtons(){
    //console.log('generate event buttons ran')
    let button = []
    //console.log(CURRENT_SESSION.user_events.length);
    if(!(CURRENT_SESSION.user_events.length === 0)){
        for(let i=0; i<CURRENT_SESSION.user_events.length; i++){
            //console.log(i);
            //console.log(`console.log(Event: ${CURRENT_SESSION.user_events[i].name}`);
            button.push(`<button type="button" class="event-button generate-sticker" id="${CURRENT_SESSION.user_events[i].name}">${CURRENT_SESSION.user_events[i].name}</button>`)
        }}
    //console.log(button)
    return button;
}

//this sections handles making a new event, including displaying a form, retrieving information,
//posting a new event and displaying the event page
function handleNewEventButton(){
    $('.make-new-event').click(e => newEventForm())
}

function newEventForm(){
    //('new event form ran');
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
        //console.log(event);
        postNewEvent(event);
    })
}

function postNewEvent(data){
    //console.log('post new event ran');
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
        //console.log(name)
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

    console.log(`userID: ${CURRENT_SESSION.user_id}`);
    console.log(`organizerId: ${CURRENT_SESSION.organizer_id}`);

    const event = renderEvent(name, location, dates)
    retrieveActivities(id);
    //console.log(activity);
    $('.event-information').html(event);
    handleEditEventButtons();
    handleDeleteEvent();
    handleViewProfile()
    handleNewActivity();

    if(CURRENT_SESSION.user_id === CURRENT_SESSION.organizer_id){
        console.log('not equal')
        $('.include-edit').hover(function(){
            $(this).children('button').removeClass("hidden");
        }, function(){
            $(this).children('button').addClass("hidden");
        });}
}

function renderEvent(name, location, dates){
    return`
        <div class="include-edit">
            <h2 class="event-name title">${name}</h2>
            <div class="event-button-section">
                <button type="button" class="edit edit-event-name not-organizer hidden">edit</button>
                <button type="button" class="js-delete-event not-organizer hidden sticker">Delete</button>
            </div>
        </div>
        <div class="event-details-section">
            <div class="event-details wrapper-event-details blue-border">
                <div class="thumb-green"></div>
                <p class="label">Location:</p>
                <div class="include-edit">
                    <p class="emphasis">${location}!</p>
                    <button type="button" class="edit edit-event-location not-organizer hidden">edit</button>
                </div>
                <p class="label">Dates:</p>
                <div class="include-edit">
                    <p class="emphasis">${dates}</p>
                    <button type="button" class="edit edit-event-dates not-organizer hidden">edit</button>
                </div>
                <p class="emphasis">Join a fun activity below or create your own!</p>
                <button type="button" class="js-make-activity circle-sticker">New Activity</button>
            </div> 
        </div>` 
}

/*            <div class="join-activity wrapper-event-details blue-border">
                <div class="thumb-green"></div>
                <p class="emphasis">Join a fun activity below or create your own!</p>
                <button type="button" class="js-make-activity circle-sticker">New Activity</button>   
        </div>*/

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
    console.log(CURRENT_SESSION.event_id)
    console.log(data);
    $.ajax({
        type: "PUT",
        url: `/event/${CURRENT_SESSION.event_id}`,
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: handleNavEvent,
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
    //console.log('retrieve activities')
    //console.log(eventId)

    $.ajax({
        type: "GET",
        url: `/activity/event/${eventId}`,
        contentType: 'application/json',
        dataType: "json",
        success: displayActivities
    })
}

function displayActivities(data){
    //console.log('display activities');
    //console.log(data);
    const activity = data.map((item, index) => renderActivities(item))
    $('.all-activities').html(activity);
    handleRSVP();
}

function renderActivities(results){

    let price = calculateCost(results);
    if(price === 0){price = `<div class="free"></div>`}else{price = `<div></div>`}
    
    let kidNumber = 0;
    let adultNumber = results.adult_number;
    let number;

    if(results.kid_number){
        kidNumber = results.kid_number
    }
    number = kidNumber + adultNumber
    if(number ==1){
        number = `${number} person is`
    }else {number = `${number} people are`}

    let kids = `<div></div>`;
    //console.log(results.kids_welcome);
    //console.log(results.kids_welcome===true);
    if(results.kids_welcome===true){kids = `<div class="js-kid-friendly"></div>`}

    let attend;
    //console.log(results.attendees[0]);
    //console.log(`"${CURRENT_SESSION.user_id}"`);
    //console.log(results.attendees[0].includes(CURRENT_SESSION.user_id));
    if(results.attendees.includes(CURRENT_SESSION.user_id)){
        attend = `<div class="already-going"></div>`
    }else{
        attend = `<button type="button" name="${results.name}" class="js-RSVP sticker-green-circle" id="${results.id}">Join!</button>`
    }

    let thumbColorArray = ["thumb-yellow", "thumb-green", "thumb-red"]
    let borderColorArray = ["light-blue-border", "yellow-border", "green-border"]
    let rotateArray = ["rotate-right", "rotate-left"]
    let flexArray = ["flex-grow", "flex-grow-more", "flex-grow-most"]
    let thumbColor = thumbColorArray[Math.floor(Math.random()*thumbColorArray.length)]
    let borderColor = borderColorArray[Math.floor(Math.random()*borderColorArray.length)]
    let rotate = rotateArray[Math.floor(Math.random()*rotateArray.length)]
    let flex = flexArray[Math.floor(Math.random()*flexArray.length)]

    return `        
        <div class="activity wrapper ${borderColor} ${rotate} ${flex}">
            <div class="${thumbColor}"></div>
            <button type="button" class="activity-name" id="${results.id}">${results.name}</button>
            <div class="attending">
                <p class="fun-text">${number} going</p>
            </div>
            <div class="extra-info">                
                ${price}
                ${kids}
            </div>
            ${attend}
         </div>`;
}

function handleNewActivity(){
    $('.js-make-activity').click(e =>{
        //console.log('handle new activity ran');
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
function createActivity(){
    return`
            <form class="js-activity-form">
                <fieldset class="basic-info">
                    <legend>Provide Activity Information</legend>
                    <div class="input-line">    
                        <label for="activity-name">Activity name</label>
                        <input type="text" name="activity-name" id="activity-name" required>
                    </div>
                    <div class="input-line">    
                        <label for="activity-url">Website link (opt)</label>
                        <input type="text" name="activity-url" id="activity-url">
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
                <fieldset class="price-info hidden">
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
                <fieldset class="guest-info hidden">
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
                <div class="form-buttons">
                        <button type="button" class="show-basic-info sticker-green hidden">Basic</button>
                        <button type="button" class="show-price-info sticker-green">Price?</button>
                        <button type="button" class="show-guest-info sticker-green">Details</button>
                    <button type="submit" class="submit-new-activity sticker">Submit</button>
                </div>
            </form>`
}

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
        console.log('basic info clicked')
        $('.price-info').addClass('hidden')
        $('.guest-info').addClass('hidden')
        $('.basic-info').removeClass('hidden')
        $('.show-basic-info').addClass('hidden')
        $('.show-price-info').removeClass('hidden')
        $('.show-guest-info').removeClass('hidden')
    })
}

function handleSubmitNewActivity(){
    $('.js-activity-form').on('submit', function(e){
        e.preventDefault();
        console.log('submit activity clicked')
        //console.log($(this).find(`#kid-friendly`.checked))
        let kids = parseInt($(this).find('#kids-attending').val(), 10);
        if(kids){kids=kid}else kids=0;
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
            kids_welcome: $(this).find(`#kid-friendly`).is(":checked"),
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
        //console.log('handle submit activity ran');
        console.log(data);
        //console.log(CURRENT_SESSION.user_id);
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
        success: retrieveActivityId,
        dataType: "json"
    })
}

function retrieveActivityId(results){
    let id = results.id
    showActivityPage(id)
}

function showActivityPage(id){
    $('.js-event-page').addClass("hidden");
    $('.js-activity-page').removeClass("hidden");
    $('body, html').animate({scrollTop:0}, 0);
    retrieveActivityData(id)
}

function retrieveActivityData(id){
    $.ajax({
        type: "GET",
        url: `activity/${id}`,
        contentType: "application/json",
        success: displayActivityPage,
        dataType: "json"
    })
}

function displayActivityPage(results){
    const activity = renderActivityPage(results);
    $('.activity-page').html(activity);
    handleRSVP();
}

function renderActivityPage(data){
    let cost = calculateCost(data);
    if(cost === 0){cost = `<div class="free"></div>`}
    const comments = []

    let kids = `<div></div>`;
    if(data.kids_welcome===true){kids = `<div class="js-kid-friendly"></div>`}

    let attend;
    if(data.attendees.includes(CURRENT_SESSION.user_id)){
        attend = `<div class="already-going"></div>`
    }else{
        attend = `<button type="button" name="${data.name}" class="js-RSVP sticker-green-circle circle-sticker-bigger" id="${data.id}">Join!</button>`
    }

    let date;
    let time = `<p></p>`
    if(data.date){date = `<p>Date: ${data.date}</p>`}else date = `<p>Date and time are flexible</p>`
    if(data.time){time = `<p>Time: ${data.time}</p>`}

    
    for (i=0; i<data.activity_comments.length; i++){
        let eachComment = `
            <div class="comment">
                <blockquote>${data.activity_comments[i].comment}</blockquote>
                <cite>${data.activity_comments[i].name}</cite>
            </div>`
        comments.push(eachComment);
    }

    let link=`<p></p>`
    if(data.url){link=`<p><a href=${data.url} target="_blank">Visit Website</a></p>`};

    return`
        <h2 class="title activity-title">${data.name}</h2>
        <div class="activity-detail-section">            
            <div class="activity-details paper light-blue-border rotate-left">
                <div class="thumb-green"></div>
                <h3 class="handwrite">Activity details</h3>
                <p>Host: <span class="fun-text">${data.host_name}</span></p>
                <div class="date-time">
                    ${date}
                    ${time}
                </div>                
                ${cost}
                ${kids}
                <p>Who's Going?</p>
                <p class="fun-text">${data.adult_number} adults ${data.kid_number} kids</p>
                ${attend}
                ${link}
            </div>
            <div class="activity-discussion paper green-border rotate-right">
                <div class="thumb-yellow"></div>
                <h3 class="handwrite">Join the discussion!</h3>
                ${comments}
                <textarea class="text-input"></textarea>
                <button type="button" class="submit-comment text-area sticker">Comment</button>
            </div>
        </div>`
}

function calculateCost(data){
    let adultCost = 0;
    let kidCost = 0;
    let groupCost = 0;
    let totalCost
    //console.log(data.name);
    //console.log(data.kid_cost);
    //console.log(data.adult_cost);
    //console.log(data.group_cost);
    //if ((results.adult_cost || results.kid_cost) && (results.adult_cost > 0 || results.kid_cost > 0))
    if(data.adult_cost && data.adult_cost > 0){adultCost = data.adult_cost;}
    if(data.kid_cost && data.kid_cost > 0 ){kidCost = data.kid_cost}
    if(data.group_cost && data.group_cost > 0){groupCost = data.group_cost}

    //console.log(groupCost);

    if (adultCost === 0 && kidCost === 0 && groupCost === 0){
        totalCost = 0;
    }else if (adultCost === 0 && kidCost === 0 && groupCost > 0){
        totalCost = `<div class="activity-cost"><p>Group Price: $${groupCost.toFixed([2])}/group of${data.group_size}</p></div>`
    }else if (groupCost === 0 && kidCost > 0 && adultCost > 0){
        adult = adultCost.toFixed([2]);
        child = kidCost.toFixed([2]);
        totalCost = `<div class="activity-cost">
                        <p>Adult price: $${adultCost.toFixed([2])}</p>
                        <p>Child price: $${kidCost.toFixed([2])}</p></div>`
    }else if(groupCost === 0 && kidCost === 0 && adultCost > 0){
        totalCost = `<div class="activity-cost">
                        <p>Price: $${adultCost.toFixed([2])} per person </p>
                    </div>`
    }else{
        totalCost = `
            <div class="activity-cost">
                <p>$${adultCost.toFixed([2])} /person</p>
                <p>$${groupCost.toFixed([2])} /group of ${data.group_size}</p>
            </div>`
    }

    //console.log(totalCost);
    return totalCost;
}

function handleRSVP(){
    $('.js-RSVP').click(function(e){
        let activityId = this.id;
        let activityName = this.name;
        showActivityPage(activityId);
        openModal();
        const rsvp = respondActivity(activityId, activityName);
        $('.lined-paper').html(rsvp);
        handleSubmitResponse();    
    })
}

//form for adding a response; appears in modal
function respondActivity(id, name){
    return`        
        <section class="rsvp-page">
            <form class="js-rsvp-form">
                <h3 class="handwrite">${name}</h3>
                <fieldset>
                    <legend>Are you bringing anyone?</legend>
                    <label for="kids-attending">Kids (under 12)</label>
                    <input type="number" max="10" min="0"name="kids-attending" id="kids-attending">
                    <label for="adults-attending">Adults (aside from you)</label>
                    <input type="number" max="10" min="0" name="adults-attending" id="adults-attending">
                </fieldset>
                <button type="submit" class="submit-rsvp sticker" id="${id}">Join</button>
            </form>
        </section>`
}

function handleSubmitResponse(){
    $('.js-rsvp-form').submit(function(e){
        e.preventDefault();
        //console.log('handle submit rsvp ran');
        closeModal();
        let kids = parseInt($(this).find('#kids-attending').val(), 10);
        if(kids){kids=kids}else kids=0;
        let adults = parseInt($(this).find('#adults-attending').val(), 10);
        if(adults){adults=adults}else adults=0; adults++;      
        let id = $(this).find('.submit-rsvp').attr("id");
        let data = {
            id: id,
            adult_number: adults,
            kid_number: kids,
            userId: CURRENT_SESSION.user_id
        }
        //console.log(data);
        updateJoinActivity(data)
    })
}

function updateJoinActivity(data){
    //console.log(data.id)
    $.ajax({
        type: "PUT",
        url: `activity/join/${data.id}`,
        data: JSON.stringify(data),
        contentType: "application/json",
        success: closeModal,
        dataType: "json"})
}

function handleInviteLink(){
    //console.log('handle invite link ran');
    let eventId = getQueryVariable("eventId")
    let event = getQueryVariable("name")
    //console.log(eventId);
    //console.log(name);
    CURRENT_SESSION.event_id = eventId;
    if(!event==false){
        let eventName = event.split("+").join(" ")
        $('.welcome-message').html(`You have been invited to join <span class="invite-name">${eventName}</span>`)
        //console.log(eventName)
        $('.js-not-invite').remove();
        $('.intro-content').addClass("intro-content-invite")}
}

function getQueryVariable(variable){
    let query = window.location.search.substring(1);
    const querypart = query.split("&");
    //console.log(querypart);
    for(let i=0; i<querypart.length; i++){;
        let querypair = querypart[i].split("=");
        if (querypair[0] == variable){return querypair[1]}
    }
    return (false);
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

handleMockUsers();
handleInviteLink();
handleStartButtons();
handleNavButtons();
handleActivity();
handleCloseModal();
