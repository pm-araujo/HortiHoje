using System.Web;
using System.Web.Optimization;

namespace HortiHoje
{
    public class BundleConfig
    {
        // For more information on bundling, visit http://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {

            // App Services
            bundles.Add(new ScriptBundle("~/bundles/app/services").Include(
                "~/app/services/datacontext.js",
                "~/app/services/directives.js",
                "~/app/services/entityManagerFactory.js",
                "~/app/services/model.js",
                "~/app/services/routeMediator.js",

                "~/app/services/repositories.js",
                "~/app/services/repository.abstract.js",
                "~/app/services/repository.activity.js",
                "~/app/services/repository.reporter.js",
                "~/app/services/repository.lookup.js"
            ));

            // App
            bundles.Add(new ScriptBundle("~/bundles/app").Include(
                "~/app/activity/activities.js",
                "~/app/admin/admin.js",
                "~/app/dashboard/dashboard.js",
                "~/app/layout/shell.js",
                "~/app/layout/sidebar.js",
                "~/app/layout/topnav.js",
                "~/app/login/login.js",
                "~/app/reporter/reporters.js"
            ));

            // Common
            bundles.Add(new ScriptBundle("~/bundles/common").Include(
                "~/app/common/common.js",
                "~/app/common/logger.js",
                "~/app/common/spinner.js",
                "~/app/common/bootstrap/bootstrap.dialog.js" // common.boostrap modules
            ));

            // Bootstrapping
            bundles.Add(new ScriptBundle("~/bundles/bootstrapping").Include(
                "~/app/app.js",
                "~/app/config.js",
                "~/app/config.exceptionHandler.js",
                "~/app/config.route.js"
            ));

            // Breeze Dependencies
            bundles.Add(new ScriptBundle("~/bundles/breeze").Include(
                "~/scripts/breeze.debug.js",
                "~/scripts/breeze.angular.js",
                "~/scripts/breeze.directives.js",
                "~/scripts/breeze.saveErrorExtensions.js",
                "~/scripts/breeze.to$q.shim.js" // Needed only if using to$q
            ));

            // Vendor Scripts
            bundles.Add(new ScriptBundle("~/bundles/vendor").Include(
                    "~/scripts/jquery-2.1.1.min.js",
                    "~/scripts/angular.min.js",
                    "~/scripts/angular-animate.min.js",
                    "~/scripts/angular-route.min.js",
                    "~/scripts/angular-sanitize.min.js",
                    "~/scripts/boostrap.min.js",
                    "~/scripts/toastr.min.js",
                    "~/scripts/moment.min.js",
                    "~/scripts/ui-bootstrap-tpls-0.10.0.min.js",
                    "~/scripts/spin.js"
                ));

            // Styles
            bundles.Add(new StyleBundle("~/bundles/css").Include(
                      "~/content/ie10mobile.css",
                      "~/content/bootstrap.min.css",
                      "~/content/font-awesome.min.css",
                      "~/content/toastr.min.css",
                      "~/content/customtheme.css",
                      "~/content/styles.css",
                      "~/content/breeze.directives.css"
            ));

            BundleTable.EnableOptimizations = true;
        }
    }
}
