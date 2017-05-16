// Type definitions for ldclient-node

/**
 * The LaunchDarkly Node.js client interface.
 *
 * Documentation: http://docs.launchdarkly.com/docs/node-sdk-reference
 */

declare module "ldclient-node" {
  /**
   * The LaunchDarkly static global.
   */
  export function init(key: string, options?: LDOptions): LDClient;

  /**
   * The types of values a feature flag can have.
   *
   * Flags can have any JSON-serializable value.
   */
  export type LDFlagValue = any;

  /**
   * A map of feature flags from their keys to their values.
   */
  export type LDFlagSet = {
    [key: string]: LDFlagValue,
  };

  /**
   * LaunchDarkly initialization options.
   */
  export interface LDOptions {
    /**
     * The base uri for the LaunchDarkly server.
     *
     * This is used for enterprise customers with their own LaunchDarkly instances.
     * Most users should use the default value.
     */
    base_uri?: string;

    /**
     * The stream uri for the LaunchDarkly server.
     *
     * This is used for enterprise customers with their own LaunchDarkly instances.
     * Most users should use the default value.
     */
    stream_uri?: string;

    /**
     * The events uri for the LaunchDarkly server.
     *
     * This is used for enterprise customers with their own LaunchDarkly instances.
     * Most users should use the default value.
     */
    events_uri?: string;

    /**
     * In seconds, controls the request timeout to LaunchDarkly.
     */
    timeout?: number;

    /**
     * Controls the maximum size of the event buffer. LaunchDarkly sends events asynchronously, and buffers them for efficiency.
     */
    capacity?: number;

    /**
     * Configures a logger for warnings and errors generated by the SDK.
     * 
     * This can be a custom logger or an instance of winston.Logger
     */
    logger?: LDLogger | object;


    /**
     * Feature store used by the LaunchDarkly client, defaults to in memory storage.
     * 
     * The SDK provides an in memory feature store as well as a redis feature store.
     */
    feature_store?: LDFeatureStore;

    /**
     * In seconds, controls how long LaunchDarkly buffers events before sending them back to our server.
     */
    flush_interval?: number;

    /**
     * In seconds, controls the time between polling requests.
     */
    poll_interval?: number;

    /**
     * Allows you to specify a host for an optional HTTP proxy.
     */
    proxy_host?: string;

    /**
     * Allows you to specify a port for an optional HTTP proxy.
     * Both the host and port must be specified to enable proxy support.
     */
    proxy_port?: string;

    /**
     * Allows you to specify basic authentication parameters for an optional HTTP proxy.
     * Usually of the form username:password.
     */
    proxy_auth?: string;

    /**
     * Whether the client should be initialized in offline mode.
     */
    offline?: boolean;

    /**
     * Whether streaming or polling should be used to receive flag updates.
     */
    stream?: boolean;

    /**
     * Whether to rely on LDD for feature updates.
     */
    use_ldd?: boolean;

  }

  /**
   * A LaunchDarkly user object.
   */
  export interface LDUser {
    /**
     * A unique string identifying a user.
     */
    key: string;

    /**
     * The user's name.
     *
     * You can search for users on the User page by name.
     */
    name?: string;

    /**
     * The user's first name.
     */
    firstName?: string;

    /**
     * The user's last name.
     */
    lastName?: string;

    /**
     * The user's email address.
     *
     * If an `avatar` URL is not provided, LaunchDarkly will use Gravatar
     * to try to display an avatar for the user on the Users page.
     */
    email?: string;

    /**
     * An absolute URL to an avatar image for the user.
     */
    avatar?: string;

    /**
     * The user's IP address.
     *
     * If you provide an IP, LaunchDarkly will use a geolocation service to
     * automatically infer a `country` for the user, unless you've already
     * specified one.
     */
    ip?: string;

    /**
     * The country associated with the user.
     */
    country?: string;

    /**
     * Whether to show the user on the Users page in LaunchDarkly.
     */
    anonymous?: boolean;

    /**
     * Any additional attributes associated with the user.
     */
    custom?: {
      [key: string]: string | boolean | number | Array<string | boolean | number>,
    };
  }

  /**
   * The LaunchDarkly client logger interface.
   * 
   * The client will output informational debugging messages to the logger.
   * Internally, this logger defaults to an instance of winston.Logger, which takes
   * logs a variadic sequence of variables.
   * See: https://github.com/winstonjs/winston
   * 
   */
  export interface LDLogger {
    /**
     * The error logger.
     * 
     * @param args
     *  A sequence of any javascript variables
     */
    error: (...args: any[]) => void;

    /**
     * The warning logger.
     * 
     * @param args
     *  A sequence of any javascript variables
     */
    warn: (...args: any[]) => void;

    /**
     * The info logger.
     * 
     * @param args
     *  A sequence of any javascript variables
     */
    info: (...args: any[]) => void;

    /**
     * The debug logger.
     * 
     * @param args
     *  A sequence of any javascript variables
     */
    debug: (...args: any[]) => void;
  }

  /**
   * The LaunchDarkly client feature store.
   * 
   * The client uses this internally to store flag updates it
   * receives from LaunchDarkly.
   */
  export interface LDFeatureStore {
    /**
     * Get a flag's value.
     * 
     * @param key
     *  The flag key
     *  
     * @param callback
     *  Will be called with the resulting flag.
     */
    get: (key: string, callback: (res: LDFlagValue) => void) => void;

    /**
     * Get all flags.
     * 
     * @param callback
     *  Will be called with the resulting flag set.
     */
    all: (callback: (err: any, res: LDFlagSet) => void) => void;

    /**
     * Initialize the store.
     * 
     * @param flags
     *  Populate the store with an initial flag set.
     * 
     * @param callback
     *  Will be called when the store has been initialized.
     */
    init: (flags: LDFlagSet, callback?: () => void) => void;

    /**
     * Delete a key from the store.
     * 
     * @param key
     *  The flag key.
     * 
     * @param version
     *  The next version to increment the flag. The store should not update
     * a newer version with an older version.
     * 
     * @param callback
     *  Will be called when the delete operation is complete.
     */
    delete: (key: string, version: string, callback?: () => void) => void;

    /**
     * Upsert a flag to the store.
     * 
     * @param key
     *  The flag key.
     * 
     * @param flag
     *  The feature flag for the corresponding key.
     * 
     * @param callback
     *  Will be called after the upsert operation is complete.
     */
    upsert: (key: string, flag: LDFlag, callback?: () => void) => void;

    /**
     * Is the store initialized?
     * 
     * @param callback
     *  Will be called when the store is initialized.
     * 
     * @returns
     *  Truthy if the cache is already initialized.
     * 
     */
    initialized: (callback?: (err) => void) => bool;

    /**
     * Close the feature store.
     * 
     * @returns
     *  The store instance.
     */
    close: () => LDFeatureStore;
  }

  /**
   * The LaunchDarkly client's instance interface.
   *
   * @see http://docs.launchdarkly.com/docs/js-sdk-reference
   */
  export interface LDClient {
    /**
     * @returns Whether the client library has completed initialization.
     */
    initialized: () => boolean;

    /**
     * Retrieves a flag's value.
     *
     * @param key
     *   The key of the flag for which to retrieve the corresponding value.
     * @param user
     *   The user for the variation.
     *
     *   The variation call will automatically create a user in LaunchDarkly if a user with that user key doesn't exist already.
     *
     * @param defaultValue
     *   The value to use if the flag is not available (for example, if the
     *   user is offline or a flag is requested that does not exist).
     *
     * @param callback
     *   The callback to receive the variation result.
     */
    variation: (key: string, user: LDUser, defaultValue: LDFlagValue, callback?: (err: any, res: LDFlagValue) => void) => void;

    toggle: typeof variation;

    /**
     * Retrieves a flag's value.
     *
     * @param key
     *   The key of the flag for which to retrieve the corresponding value.
     * @param user
     * @param callback
     *   The node style callback to receive the variation result.
     */
    all_flags: (user: LDUser, callback?: (err: any, res: LDFlagSet) => void) => void;

    /**
     *
     * The secure_mode_hash method computes an HMAC signature of a user signed with the client's SDK key.
     * 
     * If you're using our JavaScript SDK for client-side flags, this
     * method generates the signature you need for secure mode.
     *
     * @param user
     *
     * @returns The hash.
     */
    secure_mode_hash: (user: LDUser) => string;

    /**
     * Close the update processor as well as the attached feature store.
     */
    close: () => void;


    /**
     * 
     * @returns Whether the client is configured in offline mode.
     */
    is_offline: () => boolean;

    /**
     * Track page events to use in goals or A/B tests.
     *
     * LaunchDarkly automatically tracks pageviews and clicks that are
     * specified in the Goals section of their dashboard. This can be used
     * to track custom goals or other events that do not currently have
     * goals.
     *
     * @param key
     *   The event to record.
     * @param user
     *   The user to track.
     * @param data
     *   Additional information to associate with the event.
     */
    track: (key: string, user: LDUser, data?: any) => void;

    /**
     * Identifies a user to LaunchDarkly.
     *
     * This only needs to be called if the user changes identities because
     * normally the user's identity is set during client initialization.
     *
     * @param user
     *   A map of user options. Must contain at least the `key` property
     *   which identifies the user.
     */
    identify: (user: LDUser) => void;

    /**
     * Flush the queue
     * 
     * Internally, the LaunchDarkly SDK keeps an event queue for track and identify calls.
     * These are flushed periodically (see configuration option: flush_interval)
     * and when the queue size limit (see configuration option: capacity) is reached.
     */
    flush: (callback: (err: any, res: boolean) => void) => void;
  }
}
