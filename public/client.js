function handleLogin(){
    $('.js-login-button').click(e =>{
        e.preventDefault();
        $('.js-landing-page').addClass("hidden");
        $('.js-event-page').removeClass("hidden");
    });
};

function handleActivity(){
    $('.js-event-page').on('click', '.activity', e =>{
        $('.js-event-page').addClass("hidden");
        $('.js-activity-page').removeClass("hidden");
    });
};

handleLogin();
handleActivity();