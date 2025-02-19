let stylesAnimmetedC = [ 'animate__slideInDown', /*'animate__slideInLeft',*/ 'animate__slideInRight', 'animate__slideInUp' ];
let styleNowstylesAnimmetedC = stylesAnimmetedC[Math.floor((Math.random() * stylesAnimmetedC.length))];

if(DAO.DB.get('isEnableAnimations') == true){
    $(".container-animated-style").addClass(styleNowstylesAnimmetedC);
}

// Pre loads //

selectAnimation(DAO.DB.get('animation'));
selectModelAnimation(DAO.DB.get('modelAnimation'));
enbAnimations(DAO.DB.get('isEnableAnimations'));

// Pre loads //

$(document).ready(async () => {

    $("#s-enAnimations").change(async () => {
        enbAnimations($("#s-enAnimations").val());
    });

    $("#s-Manimations").change(async () => {
        selectModelAnimation($("#s-Manimations").val());
    });

    $("#s-animation").change(async () => {
        selectAnimation($("#s-animation").val());
    });

});

function enbAnimations(isEnb) {
    if(isEnb == "true" || isEnb == true){
        $(".container-animated-style").addClass(styleNowstylesAnimmetedC);
        $("#s-enAnimations option[value='true']").prop("selected", true);
        $("#s-Manimations").prop("disabled", false);
        let value = $("#s-Manimations").val();
        if(value != "random"){
            $("#s-animation").prop("disabled", false);
        }
        else{
            $("#s-animation").prop("disabled", true);
            $("#s-animation option[value='random']").prop("selected", true);
        }
        DAO.DB.set('isEnableAnimations', true);
    }
    else{
        $(".container-animated-style").removeClass(styleNowstylesAnimmetedC);
        $("#s-enAnimations option[value='false']").prop("selected", true);
        $("#s-Manimations").prop("disabled", true);
        $("#s-animation").prop("disabled", true);
        DAO.DB.set('isEnableAnimations', false);
    }
}

function selectModelAnimation(type) {
    if(type != "random" && type != null){
        if(DAO.DB.get('isEnableAnimations') == true){
            $("#s-Manimations").prop("disabled", false);
            $("#s-animation").prop("disabled", false);
        }
        $("#s-Manimations option[value='"+type+"']").prop("selected", true);
        DAO.DB.set('modelAnimation', type);
    }
    else{
        selectAnimation('random');
        DAO.DB.set('modelAnimation', 'random');
        if(DAO.DB.get('isEnableAnimations') == false)
            $("#s-Manimations").prop("disabled", true);
        $("#s-animation").prop("disabled", true);
        $("#s-Manimations option[value='random']").prop("selected", true);
    }
}

function selectAnimation(type) {
    if(type != "random" && type != null){
        $("#s-animation option[value='"+type+"']").prop("selected", true);
        DAO.DB.set('animation', type);
    }
    else{
        DAO.DB.set('animation', 'random');
        $("#s-animation option[value='random']").prop("selected", true);
    }
}