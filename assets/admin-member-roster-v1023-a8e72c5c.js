(function(){
  function checkedDepartments(){return [...document.querySelectorAll('.targetDept:checked')].map(x=>x.value)}
  async function writeRoster(survey,departments,force){
    if(!survey?.id||(!force&&Array.isArray(survey.memberRosterIds)))return;
    let ids=rosterIdsForMembersV1023(D.members,departments);
    await doc('surveys',survey.id).set({memberRosterIds:ids,memberRosterVersion:'v1',memberRosterCapturedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
    survey.memberRosterIds=ids;survey.memberRosterVersion='v1';
  }
  function findCreatedSurvey(beforeIds){return D.surveys.find(s=>!beforeIds.has(s.id))||D.surveys.find(s=>s.id===activeSurveyId)}

  if(typeof saveSurvey==='function'){
    const saveSurveyBeforeV1023=saveSurvey;
    saveSurvey=async function(){
      const wasNew=surveyFormMode==='new',beforeIds=new Set(D.surveys.map(s=>s.id)),departments=checkedDepartments();
      const result=await saveSurveyBeforeV1023.apply(this,arguments);
      if(wasNew&&surveyFormMode==='view'){
        try{await writeRoster(findCreatedSurvey(beforeIds),departments);await loadAll();renderFront();renderAdmin()}
        catch(e){console.error('save activity member roster failed',e);alert('活動已建立，但建立當下的人員名單尚未保存；請檢查網路後重新開啟活動再試。')}
      }
      return result;
    };
    window.saveSurvey=saveSurvey;
  }

  if(typeof duplicateSurveyV719==='function'){
    const duplicateSurveyBeforeV1023=duplicateSurveyV719;
    duplicateSurveyV719=async function(){
      const beforeIds=new Set(D.surveys.map(s=>s.id));
      const result=await duplicateSurveyBeforeV1023.apply(this,arguments);
      const created=findCreatedSurvey(beforeIds);
      if(created&&!beforeIds.has(created.id)){
        try{await writeRoster(created,created.targetDepartments,true);await loadAll();renderFront();renderAdmin()}
        catch(e){console.error('save copied activity member roster failed',e);alert('活動複本已建立，但人員名單尚未保存；請檢查網路後再試。')}
      }
      return result;
    };
    window.duplicateSurveyV719=duplicateSurveyV719;
  }
})();
