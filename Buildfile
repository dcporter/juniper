# ==========================================================================
# Project:   Juniper
# Copyright: @2014 Dave Porter
# ==========================================================================

# This is your Buildfile, which determines how your project is built.
# In addition to this Buildfile, each of your apps and frameworks may have its
# own Buildfile with settings specific to each.

# General configuration.
config :all, :required => :sproutcore

# Development (debug) mode configuration.
mode :debug do
end

# Production (build) mode configuration.
mode :production do
end



# Proxying.
# When running the app locally, same-origin policy prevents the app (at localhost)
# from accessing other domains.  One of the major roles of the SproutCore
# development server is to proxy local requests for remote resources so that
# the browser believes they are coming from the same domain.
#
# You should place all your proxy directives in this Buildfile.
#
# For example, proxy all requests for '/users' to 'https://my-domain.com/people'.
# proxy "/users", :to => "my-domain.com", :secure => true, :url => "/people"


# To learn more about configuring the Buildfile, please visit
# http://guides.sproutcore.com/build_tools.html.
