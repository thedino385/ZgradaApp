using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(ZgradaApp.Startup))]
namespace ZgradaApp
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
