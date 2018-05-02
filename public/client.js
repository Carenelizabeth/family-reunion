function handleLogin(){
    $('.js-login').submit(e =>{
        e.preventDefault();
        let email = $(e.currentTarget).find('#login-email').val();
        console.log(email);
        let password = $(e.currentTarget).find('#user-password').val();
        console.log(password);
<<<<<<< HEAD
        if (!(validateLogin(email, password))){alert: "oh, no!"}
        else{showEventPage()}
=======
        validateLogin(email, password);
        showEventPage();
>>>>>>> b4169f7d7c0b553737f343cf90d8c3033984d882
    });
};

function showEventPage(){
    $('.js-landing-page').addClass("hidden");
    $('.js-event-page').removeClass("hidden");
    const activity = activitySTORE.map((item, index) =>{
        renderActivities(item);
    });
    console.log(activity);
    $('.all-activities').html(activity);
}

function renderActivities(results){
    console.log(results.activity_name);
    return`        
        <div class="activity">
            <h2 class="activity-name">${results.activity_name}</h2>
            <p class="host-name">${results.host_name}</p>
            <p class="price">${results.activity_cost}</p>
        </div>`;
}

function validateLogin(email, password){
    console.log(email);
    if(!(email.includes('@'))){
        alert("Please enter a valid email")
        return false;
    }
}

function showEventPage(){
    $('.js-landing-page').addClass("hidden");
    $('.js-event-page').removeClass("hidden");
}


function handleActivity(){
    $('.js-event-page').on('click', '.activity', e =>{
        $('.js-event-page').addClass("hidden");
        $('.js-activity-page').removeClass("hidden");
    });
};

handleLogin();
handleActivity();