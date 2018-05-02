function handleLogin(){
    $('.js-login').submit(e =>{
        e.preventDefault();
        let email = $(e.currentTarget).find('#login-email').val();
        console.log(email);
        console.log('what is going on?');
        let password = $(e.currentTarget).find('#user-password').val();
        console.log(password);
        validateLogin(email, password);
        showEventPage();
    });
};

function showEventPage(){
    $('.js-landing-page').addClass("hidden");
    $('.js-event-page').removeClass("hidden");
    const activity = activitySTORE.map((item, index) =>{
        renderActivities(item);
    });
    console.log(activity);
    //$('.all-activities').html(activity);
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

function handleActivity(){
    $('.js-event-page').on('click', '.activity', e =>{
        $('.js-event-page').addClass("hidden");
        $('.js-activity-page').removeClass("hidden");
    });
};

handleLogin();
handleActivity();