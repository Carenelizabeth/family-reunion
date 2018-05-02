//these next functions display the event page
//with all current activities listed
function showEventPage(){
    $('.js-landing-page').addClass("hidden");
    $('.js-event-page').removeClass("hidden");
    const event = renderEvent()
    const activity = activitySTORE.map((item, index) => renderActivities(item));
    console.log(activity);
    $('.event-information').html(event);
    $('.all-activities').html(activity);
}

function renderEvent(){
    return `
        <h1 class="event-name">${eventSTORE[0].event_name}</h1>
        <p>${eventSTORE[0].event_location}</p>
        <p>${eventSTORE[0].event_dates}</p>`
}

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
                <p>Activity planner:</p>
                <p>${results.host_name}</p>
            </div>
            <div>
                <p>Cost:</p>
                <p class="activity-cost">${price}</p>
            </div>
         </div>`;
    }

function validateLogin(email, password){
    console.log(email);
    if(!(email.includes('@'))){
        alert("Please enter a valid email")
        return false;
    }
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
                        <label for="activity-description"></label>
                        <textarea class="text-input" id="activity-description"></textarea>
                </fieldset>
                <fieldset>
                    <legend>Optional Fields</legend>
                        <label for="activity-date">Date</label>
                        <input type="date" name="activity-date" id="activity-date" class="date">
                        <label for="activity-time">Time</label>
                        <input type="time" name="activity-time" id="activity-time">
                        <label for="activity-cost">Price</label>
                        <input type="number" name="activity-cost" id="activity-cost">
                        <label for="kid-friendly">Suitable for chldren under 12?</label>
                        <input type="checkbox" name="kid-friendly" id="kid-friendly">
                </fieldset>
                <button type="submit" class="submit-new-activity">Submit</button>
            </form>
        </section>`
}
function showActivityPage(){
    $('.js-event-page').addClass("hidden");
    $('.js-activity-page').removeClass("hidden");
}


//event handlers
function handleLogin(){
    $('.js-login').submit(e =>{
        e.preventDefault();
        let email = $(e.currentTarget).find('#login-email').val();
        console.log(email);
        let password = $(e.currentTarget).find('#user-password').val();
        console.log(password);
        //validateLogin(email, password);
        showEventPage();
    });
};

function handleNewActivity(){
    $('.js-make-activity').click(e =>{
        console.log('handle new activity ran');
        $('.contain-modal').removeClass("behind");
        const activity = createActivity();
        $('.modal').html(activity);
    })
}

function handleRSVP(){
    $('.js-RSVP').click(e =>
    console.log('handleRSVP ran'))
}

function handleActivity(){
    $('.js-event-page').on('click', '.activity', e =>{
        showActivityPage();
    });
};

function handleCloseModal(){
    $('.overlay').click(e => $('.contain-modal').addClass("behind"));
}

function handleSubmitNewActivity(){
    $('.js-activity-form').submit(e =>{
        e.preventDefault();
        showEventPage();
    });
};

handleLogin();
handleNewActivity()
handleRSVP()
handleActivity();
handleCloseModal();
handleSubmitNewActivity();