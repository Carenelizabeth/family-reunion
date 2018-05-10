const CURRENT_SESSION = {
    username: "user",
    user_id: "12345",
    event: "Adventure with Giants",
    event_id: "5af37b7a79c9af4480fa8d68",
    organizer_id: "host id"
};

function handleStartButtons(){
    $('.js-log-in').click(e => displayLogin());
    $('.js-make-account').click(e => displayCreateAccount());
}

function displayLogin(){
    const login = renderLoginForm();
    $('.landing-page').html(login);
    handleLogin();
}

function displayCreateAccount(){
    const createUser = renderCreateAccount();
    $('.landing-page').html(createUser);
    handleNewAccount();
}

function renderLoginForm(){
    return`
        <form class="js-login">
            <fieldset>
                <legend>Log In</legend>
                <label for="login-email">Email</label>
                <input type="text" name="login-email" id="login-email" class="user-email">
                <label for="user-password">Password</label>
                <input type="text" name="user-password" id="user-password">
            </fieldset>
            <button type="submit" class="js-login-button">Submit</button>
        </form>`
}

function renderCreateAccount(){
    return`
        <form class="js-create-account">
            <fieldset>
                <legend>Create New Account</legend>
                <label for="create-user-name">Choose a public user name</label>
                <input type="text" name="create-user-name" id="create-user-name">
                <label for="login-email">Email</label>
                <input type="text" name="login-email" id="login-email" class="user-email">
                <label for="user-password">Password</label>
                <input type="text" name="user-password" id="user-password">
            </fieldset>
            <button type="submit" class="js-create-account-button">Submit</button>
        </form>`
}

//The next section handles user login and selecting the event
function handleLogin(){
    $('.js-login').submit(function(e){
        e.preventDefault();
        let password = $(this).find('#user-password').val();
        let email = $(this).find('#login-email').val();
        getUserData(email)
    });
};

function getUserData(data){
    console.log('get user data ran');
    console.log(data);
    $.ajax({
        type: "GET",
        url: "/user/",
        //data: JSON.stringify(data),
        contentType: 'application/json',
        success: showWelcomePage,
        dataType: "json"
    })
}

function handleNewAccount(){
    $('.js-create-account').submit(function(e){
        e.preventDefault();
        console.log('create Account clicked');
        const data = {
            username: $(this).find('#create-user-name').val(),
            email: $(this).find('#login-email').val(),
            password: $(this).find('#user-password').val()
        }
        createAccount(data);
    })
}

function createAccount(data){
    console.log('create account ran');
    $.ajax({
        type: "POST",
        url: "/user",
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: showWelcomePage,
        dataType: "json"
    })
}

//once user logs on, they can choose an event or make a new one
function showWelcomePage(data){
    //console.log('show welcome page ran');
    $('.js-landing-page').addClass("hidden");
    $('.js-welcome-page').removeClass("hidden");
    $('.js-event-page').addClass("hidden");
    console.log(data);
    CURRENT_SESSION.username = data.username;
    CURRENT_SESSION.user_id = data.id;
    //CURRENT_SESSION.event = data.events[0];
    //CURRENT_SESSION.event_id = data.event_id;
    console.log(CURRENT_SESSION.username);
    const welcome = renderWelcome();
    $('.welcome-page').html(welcome);
    handleEventButton();
    handleNewEventButton();
}   

function renderWelcome(){
    return`
        <div class="wrapper">
            <div class="info-section">
                <h2>Welcome ${CURRENT_SESSION.username}!</h2>
                <p>What would you like to do today?</p>
            </div>
            <div class="button-section">
                <button type="button" class="event-button">${CURRENT_SESSION.event}</button>
                <button type="button" class="make-new-event">New Event</button>
            </div>
        </div>`
}

function handleEventButton(){
    $('.event-button').click(e => getEventInformation())
}

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
            event_organizer: CURRENT_SESSION.user_id
        }
        console.log(event);
        postNewEvent(event);
    })
}

function getEventInformation(){
    $.ajax({
        type: "GET",
        url: `/event/${CURRENT_SESSION.event_id}`,
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

    CURRENT_SESSION.event_id = data.id;
    CURRENT_SESSION.organizer_id = data.organizer;

    let name = data.name;
    let location = data.location;
    let dates = data.dates;


    const event = renderEvent(name, location, dates)
    const activity = activitySTORE.map((item, index) => renderActivities(item));
    //console.log(activity);
    $('.event-information').html(event);
    $('.all-activities').html(activity);
    handleEditEventButtons();
    handleDeleteEvent();
    handleNewActivity();
    handleRSVP();
}

function postNewEvent(data){
    console.log('post new event ran');
    $.ajax({
        type: "POST",
        url: "/event",
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: showNewEventPage,
        dataType: "json"
    })
}

function showNewEventPage(data){
    //console.log('show event page ran');
    closeModal();
    $('.js-welcome-page').addClass("hidden");
    $('.js-activity-page').addClass("hidden");
    $('.js-event-page').removeClass("hidden");

    CURRENT_SESSION.event_id = data.id;
    CURRENT_SESSION.organizer_id = data.organizer;

    let name = data.name;
    let location = data.location;
    let dates = data.dates;


    const event = renderEvent(name, location, dates)
    const activity = activitySTORE.map((item, index) => renderActivities(item));
    //console.log(activity);
    $('.event-information').html(event);
    $('.all-activities').html(activity);
    handleEditEventButtons();
    handleDeleteEvent();
    handleViewProfile()
    handleNewActivity();
    handleRSVP();
}



//displays main event as a banner
function renderEvent(name, location, dates){
    return `
        <div class="info-section">
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
            <p>Join a fun activity below or create your own!</p>
        </div>
        <div class="button-section">
            <button type="button" class="js-delete-event not-organizer">Delete</button> 
            <button type="button" class="js-make-activity">New Activity</button>
            <button type="button" class="js-user-profile">View Profile</button>    
        </div>`    
}

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

/*function handleEditEventButton(){
    $('.edit-event-form').submit(function(e){
        e.preventDefault();
        let name =  $(this).find('#event-name').val();
        let location =  $(this).find('#event-location').val();
        let start =  $(this).find('#event-start-date').val();
        let end =  $(this).find('#event-end-date').val();
        console.log(name);
        console.log(location);
        updateEvent(name, location, start, end);
    })
}*/

function handleViewProfile(){

}

//displays activites that have been created under the event
function renderActivities(results){
    console.log(results.activity_name)
    let price;
    if(results.activity_cost == undefined || results.activity_cost == 0){
        price = "free"
    }
    else{
        price = `$${results.activity_cost}`
    }
    console.log(price);
    return `        
        <div class="activity">
            <h2 class="activity-name">${results.activity_name}</h2>
            <div>
                <p>Host: <span class="fun-text">${results.host_name}</span></p>
            </div>
            <div class="attending">
                <p>How many are going?</p>
                <p class="fun-text">${results.adults_attending} adults   ${results.children_attending} kids</p>
            </div>
            <div>
                <p class="activity-cost">Cost: <span="fun-text">${price}</span></p>
            </div>
            <button type="button" class="js-RSVP">RSVP</button>
         </div>`;
    }

//form for creating a new activity; appears in modal
function createActivity(){
    return`
        <section class="make-activity-page">
            <form class="js-activity-form">
                <fieldset>
                    <legend>Required Fields</legend>
                        <label for="activity-name">Activity name</label>
                        <input type="text" name="activity-name" id="activity-name">
                        <h3>Give a brief description</h3>
                        <textarea class="text-input"></textarea>
                </fieldset>
                <fieldset>
                    <legend>Optional Fields</legend>
                        <label for="activity-date">Date</label>
                        <input type="date" name="activity-date" id="activity-date" class="date">
                        <label for="activity-time">Time</label>
                        <input type="time" name="activity-time" id="activity-time">
                        <label for="activity-cost">Price</label>
                        <input type="number" step="0.01" name="activity-cost" id="activity-cost">
                        <label for="kid-friendly">Suitable for chldren under 12?</label>
                        <input type="checkbox" name="kid-friendly" id="kid-friendly">
                </fieldset>
                <button type="submit" class="submit-new-activity">Submit</button>
            </form>
        </section>`
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

function showActivityPage(){
    $('.js-event-page').addClass("hidden");
    $('.js-activity-page').removeClass("hidden");
    const activity = renderActivityPage();
    console.log(activity);
    $('.activity-page').html(activity);
    returnToEvent();
    handleRSVP();
}

function renderActivityPage(){
    return`            
        <div class="activity-details wrapper">
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

function openModal(){
    $('.contain-modal').removeClass("behind")
}

function closeModal(){
    $('.contain-modal').addClass("behind")
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

function handleCloseModal(){
    $('.overlay').click(e => closeModal());
}

function handleSubmitNewActivity(){
    $('.js-activity-form').on('submit', function(event){
        event.preventDefault();
        showActivityPage();
        closeModal();
        console.log('handle submit activity ran');
    });
};

function handleSubmitResponse(){
    $('.js-rsvp-form').submit(e =>{
        e.preventDefault();
        showActivityPage();
        closeModal();
        console.log('handle submit rsvp ran');
    })
}

function returnToEvent(){
    $('.back-to-event').click(e => getEventInformation());
}

handleStartButtons();
handleActivity();
handleCloseModal();
