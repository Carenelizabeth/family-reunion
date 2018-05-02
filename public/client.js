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

//event handlers
function handleLogin(){
    $('.js-login').submit(e =>{
        e.preventDefault();
        let email = $(e.currentTarget).find('#login-email').val();
        console.log(email);
        console.log('what is going on?');
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
    })
}

function handleRSVP(){
    $('.js-RSVP').click(e =>
    console.log('handleRSVP ran'))
}

function handleActivity(){
    $('.js-event-page').on('click', '.activity', e =>{
        $('.js-event-page').addClass("hidden");
        $('.js-activity-page').removeClass("hidden");
    });
};

handleLogin();
handleNewActivity()
handleRSVP()
handleActivity();