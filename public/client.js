const CURRENT_SESSION = {
    user: "user",
    user_id: "12345",
    event: "event",
    event_id: "event id",
    organizer_id: "host id"
};

//The next section handles user login and selecting the event
function handleLogin(){
    $('.js-login').submit(e =>{
        e.preventDefault();
        let email = $(e.currentTarget).find('#login-email').val();
        let password = $(e.currentTarget).find('#user-password').val();
        let user = "Mary"
        CURRENT_SESSION.user = user;
        console.log(CURRENT_SESSION.user);
        showWelcomePage();
    });
};

//once user logs on, they can choose an event or make a new one
function showWelcomePage(){
    //console.log('show welcome page ran');
    $('.js-landing-page').addClass("hidden");
    $('.js-welcome-page').removeClass("hidden");
    const welcome = renderWelcome();
    //console.log(welcome);
    $('.js-welcome-page').html(welcome);
    handleEventButton();
    handleNewEventButton();
}   

function renderWelcome(){
    return`
        <div class="wrapper">
            <h2>Welcome ${CURRENT_SESSION.user}!</h2>
            <p>What would you like to do today?</p>
            <div class="event-choices">
                <button type="button" class="event-button">${eventSTORE[0].event_name}</button>
                <button type="button" class="make-new-event">New Event</button>
            </div>
        </div>`
}

function handleEventButton(){
    $('.event-button').click(e => showEventPage())
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
    handleNewActivity();
    $('.all-activities').html(activity);
    handleRSVP();
}

//displays main event as a banner
function renderEvent(name, location, dates){
    return `
        <h1 class="event-name">${name}</h1>
        <p>Where? <span class="fun-text">${location}!</span></p>
        <p>When? <span class="fun-text">${dates}</span></p>
        <p>Join a fun activity below or create your own!</p>
        <button type="button" class="js-edit-event not-organizer">Edit Event</button> 
        <button type="button" class="js-make-activity">New Activity</button>`        
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
    $('.back-to-event').click(e => showEventPage());
}

handleLogin();
handleActivity();
handleCloseModal();
