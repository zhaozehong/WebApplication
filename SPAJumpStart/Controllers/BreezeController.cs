using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Breeze.WebApi;
using Newtonsoft.Json.Linq;

namespace CodeCamper.Controllers
{
  [BreezeController]
  public class BreezeController : ApiController
  {
    readonly EFContextProvider<CodeCamperDbContext> _contextProvider = new EFContextProvider<CodeCamperDbContext>();

    // ZEHONG?:  who calls this method???
    [HttpGet]
    public string Metadata()
    {
      return _contextProvider.Metadata();
    }

    [HttpPost]
    public SaveResult SaveChanges(JObject saveBundle)
    {
      // this is all we need to do on the server side
      return _contextProvider.SaveChanges(saveBundle);
    }

    [HttpGet]
    public object Lookups()
    {
      // get Rooms, Tracks & TimeSlots info via ajax
      var rooms = _contextProvider.Context.Rooms;
      var tracks = _contextProvider.Context.Tracks;
      var timeslots = _contextProvider.Context.TimeSlots;
      return new { rooms, tracks, timeslots };
    }

    [HttpGet]
    public IQueryable<Session> Sessions()
    {
      // get Sessions info via ajax
      return _contextProvider.Context.Sessions;
    }

    [HttpGet]
    public IQueryable<Person> Persons()
    {
      // get Persons info via ajax
      return _contextProvider.Context.Persons;
    }

    [HttpGet]
    public IQueryable<Person> Speakers()
    {
      // get Speakers info based on Persons info
      return _contextProvider.Context.Persons.Where(p => p.SpeakerSessions.Any());
    }

  }
}