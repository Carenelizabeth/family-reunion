function handlePretendSubmit(){
    $('.pretend-submit').click(e =>{
        $('.landing-page').addClass("hidden");
        $('.event-page').removeClass("hidden");
    });
};

function handleActivity(){
    $('.event-page').on('click', '.activity', e =>{
        $('.event-page').addClass("hidden");
        $('.activity-page').removeClass("hidden");
    });
};

handlePretendSubmit();
handleActivity();